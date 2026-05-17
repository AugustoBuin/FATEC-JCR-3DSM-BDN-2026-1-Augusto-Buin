import { Inject, Injectable } from '@nestjs/common';
import {
  IClienteRepository,
  CLIENTE_REPOSITORY,
} from '../../domain/repositories/cliente-repository.interface';
import { ClienteEntity } from '../../domain/entities/cliente.entity';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class FindClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(id: string): Promise<ClienteEntity> {
    const cliente = await this.clienteRepository.findById(id);
    if (!cliente) {
      throw new DomainError('Cliente não encontrado.', 'CLIENT_NOT_FOUND');
    }
    return cliente;
  }
}
