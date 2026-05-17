import { Inject, Injectable } from '@nestjs/common';
import { LeadEntity } from '../../domain/entities/lead.entity';
import {
  ILeadRepository,
  LEAD_REPOSITORY,
} from '../../domain/repositories/lead-repository.interface';
import {
  ILojaRepository,
  LOJA_REPOSITORY,
} from '@/modules/lojas/domain/repositories/loja-repository.interface';
import {
  ITimeRepository,
  TIME_REPOSITORY,
} from '@/modules/times/domain/repositories/time-repository.interface';
import {
  IClienteRepository,
  CLIENTE_REPOSITORY,
} from '@/modules/clientes/domain/repositories/cliente-repository.interface';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY,
} from '@/modules/usuarios/domain/repositories/usuario-repository.interface';
import { LogService } from '@/modules/logs/application/log.service';
import { CreateLeadDto } from '../dtos/create-lead.dto';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class CreateLeadUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY) private readonly leadRepository: ILeadRepository,
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
    @Inject(TIME_REPOSITORY) private readonly timeRepository: ITimeRepository,
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly logService: LogService,
  ) {}

  async execute(dto: CreateLeadDto, actorId: string): Promise<LeadEntity> {
    const loja = await this.lojaRepository.findById(dto.lojaId);
    if (!loja) throw new DomainError('Loja não encontrada.', 'LOJA_NOT_FOUND');

    const time = await this.timeRepository.findById(dto.teamId);
    if (!time) throw new DomainError('Time não encontrado.', 'TIME_NOT_FOUND');

    const cliente = await this.clienteRepository.findById(dto.clientId);
    if (!cliente)
      throw new DomainError('Cliente não encontrado.', 'CLIENTE_NOT_FOUND');

    const usuario = await this.usuarioRepository.findById(dto.userId);
    if (!usuario)
      throw new DomainError('Usuário não encontrado.', 'USER_NOT_FOUND');

    const lead = LeadEntity.create(dto);
    await this.leadRepository.save(lead);
    await this.logService.record(actorId, 'lead.created', lead.id, null, {
      teamId: lead.teamId,
      lojaId: lead.lojaId,
      clientId: lead.clientId,
      userId: lead.userId,
      source: lead.source,
      subject: lead.subject,
    });
    return lead;
  }
}
