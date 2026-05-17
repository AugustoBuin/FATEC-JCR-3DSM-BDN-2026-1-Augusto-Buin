import { LogEntity, EventType } from '../entities/log.entity';

export const LOG_REPOSITORY = Symbol('LOG_REPOSITORY');

export interface LogFilters {
  userId?: string;
  eventType?: EventType;
  targetId?: string;
}

export interface ILogRepository {
  save(log: LogEntity): Promise<void>;
  findAll(filters?: LogFilters): Promise<LogEntity[]>;
  findById(id: string): Promise<LogEntity | null>;
}
