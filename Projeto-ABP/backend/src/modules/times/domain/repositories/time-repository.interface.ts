import { TimeEntity } from '../entities/time.entity';

export const TIME_REPOSITORY = Symbol('TIME_REPOSITORY');

export interface ITimeRepository {
  findById(id: string): Promise<TimeEntity | null>;
  findAll(lojaId?: string): Promise<TimeEntity[]>;
  save(time: TimeEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
