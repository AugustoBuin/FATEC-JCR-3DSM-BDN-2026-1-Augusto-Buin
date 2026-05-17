import { LojaEntity } from '../entities/loja.entity';

export const LOJA_REPOSITORY = Symbol('LOJA_REPOSITORY');

export interface ILojaRepository {
  findById(id: string): Promise<LojaEntity | null>;
  findAll(): Promise<LojaEntity[]>;
  save(loja: LojaEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
