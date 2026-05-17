import { Inject, Injectable } from '@nestjs/common';
import { LeadEntity } from '../../domain/entities/lead.entity';
import {
  ILeadRepository,
  LEAD_REPOSITORY,
  LeadFilters,
} from '../../domain/repositories/lead-repository.interface';

@Injectable()
export class ListLeadsUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY) private readonly leadRepository: ILeadRepository,
  ) {}

  async execute(filters?: LeadFilters): Promise<LeadEntity[]> {
    return this.leadRepository.findAll(filters);
  }
}
