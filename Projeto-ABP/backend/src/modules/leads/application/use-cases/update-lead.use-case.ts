import { Inject, Injectable } from '@nestjs/common';
import { LeadEntity } from '../../domain/entities/lead.entity';
import {
  ILeadRepository,
  LEAD_REPOSITORY,
} from '../../domain/repositories/lead-repository.interface';
import {
  ITimeRepository,
  TIME_REPOSITORY,
} from '@/modules/times/domain/repositories/time-repository.interface';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY,
} from '@/modules/usuarios/domain/repositories/usuario-repository.interface';
import { LogService } from '@/modules/logs/application/log.service';
import { UpdateLeadDto } from '../dtos/update-lead.dto';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class UpdateLeadUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY) private readonly leadRepository: ILeadRepository,
    @Inject(TIME_REPOSITORY) private readonly timeRepository: ITimeRepository,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly logService: LogService,
  ) {}

  async execute(
    id: string,
    dto: UpdateLeadDto,
    actorId: string,
  ): Promise<LeadEntity> {
    const lead = await this.leadRepository.findById(id);
    if (!lead) throw new DomainError('Lead não encontrado.', 'LEAD_NOT_FOUND');

    if (dto.teamId !== undefined) {
      const time = await this.timeRepository.findById(dto.teamId);
      if (!time)
        throw new DomainError('Time não encontrado.', 'TIME_NOT_FOUND');
    }

    if (dto.userId !== undefined) {
      const usuario = await this.usuarioRepository.findById(dto.userId);
      if (!usuario)
        throw new DomainError('Usuário não encontrado.', 'USER_NOT_FOUND');
    }

    const before = {
      teamId: lead.teamId,
      userId: lead.userId,
      source: lead.source,
      subject: lead.subject,
    };
    lead.update(dto);
    await this.leadRepository.save(lead);
    await this.logService.record(actorId, 'lead.updated', lead.id, before, {
      teamId: lead.teamId,
      userId: lead.userId,
      source: lead.source,
      subject: lead.subject,
    });
    return lead;
  }
}
