import { ClienteEntity } from '../entities/cliente.entity';

export const CLIENTE_REPOSITORY = Symbol('CLIENTE_REPOSITORY');

export interface IClienteRepository {
  findById(id: string): Promise<ClienteEntity | null>;
  findByPhone(phone: string): Promise<ClienteEntity | null>;
  findByCpf(cpf: string): Promise<ClienteEntity | null>;
  findAll(filters?: { phone?: string; cpf?: string }): Promise<ClienteEntity[]>;
  save(cliente: ClienteEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
