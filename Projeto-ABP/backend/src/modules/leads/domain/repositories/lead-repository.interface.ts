import { LeadEntity } from '../entities/lead.entity';

export const LEAD_REPOSITORY = Symbol('LEAD_REPOSITORY');

export interface LeadFilters {
  lojaId?: string;
  teamId?: string;
  userId?: string;
  currentStatus?: string;
}

export interface ILeadRepository {
  findById(id: string): Promise<LeadEntity | null>;
  findAll(filters?: LeadFilters): Promise<LeadEntity[]>;
  save(lead: LeadEntity): Promise<void>;
  delete(id: string): Promise<void>;
  updateDenormalized(
    id: string,
    currentStatus: string | null,
    currentImportance: string | null,
  ): Promise<void>;
}
