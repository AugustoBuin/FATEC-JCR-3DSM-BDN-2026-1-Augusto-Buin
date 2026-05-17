import { Inject, Injectable } from '@nestjs/common';
import {
  ILeadRepository,
  LEAD_REPOSITORY,
} from '../../domain/repositories/lead-repository.interface';
import { LogService } from '@/modules/logs/application/log.service';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class DeleteLeadUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY) private readonly leadRepository: ILeadRepository,
    private readonly logService: LogService,
  ) {}

  async execute(id: string, actorId: string): Promise<void> {
    const lead = await this.leadRepository.findById(id);
    if (!lead) throw new DomainError('Lead não encontrado.', 'LEAD_NOT_FOUND');
    const snapshot = {
      teamId: lead.teamId,
      lojaId: lead.lojaId,
      clientId: lead.clientId,
      userId: lead.userId,
      source: lead.source,
      subject: lead.subject,
    };
    await this.leadRepository.delete(id);
    await this.logService.record(actorId, 'lead.deleted', id, snapshot, null);
  }
}
