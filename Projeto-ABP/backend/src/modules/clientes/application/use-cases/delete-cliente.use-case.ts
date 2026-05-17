import { Inject, Injectable } from '@nestjs/common';
import {
  IClienteRepository,
  CLIENTE_REPOSITORY,
} from '../../domain/repositories/cliente-repository.interface';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class DeleteClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const cliente = await this.clienteRepository.findById(id);
    if (!cliente) {
      throw new DomainError('Cliente não encontrado.', 'CLIENT_NOT_FOUND');
    }
    await this.clienteRepository.delete(id);
  }
}
