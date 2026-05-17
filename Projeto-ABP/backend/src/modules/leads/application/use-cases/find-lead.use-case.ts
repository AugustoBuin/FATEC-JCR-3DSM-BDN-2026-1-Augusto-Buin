import { Inject, Injectable } from '@nestjs/common';
import { LeadEntity } from '../../domain/entities/lead.entity';
import {
  ILeadRepository,
  LEAD_REPOSITORY,
} from '../../domain/repositories/lead-repository.interface';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class FindLeadUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY) private readonly leadRepository: ILeadRepository,
  ) {}

  async execute(id: string): Promise<LeadEntity> {
    const lead = await this.leadRepository.findById(id);
    if (!lead) throw new DomainError('Lead não encontrado.', 'LEAD_NOT_FOUND');
    return lead;
  }
}
