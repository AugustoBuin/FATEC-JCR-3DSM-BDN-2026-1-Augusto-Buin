import { Inject, Injectable } from '@nestjs/common';
import {
  IClienteRepository,
  CLIENTE_REPOSITORY,
} from '../../domain/repositories/cliente-repository.interface';
import { LogService } from '@/modules/logs/application/log.service';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class DeleteClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
    private readonly logService: LogService,
  ) {}

  async execute(id: string, actorId: string): Promise<void> {
    const cliente = await this.clienteRepository.findById(id);
    if (!cliente) {
      throw new DomainError('Cliente não encontrado.', 'CLIENT_NOT_FOUND');
    }
    const snapshot = {
      name: cliente.name,
      phone: cliente.phone,
      email: cliente.email,
    };
    await this.clienteRepository.delete(id);
    await this.logService.record(
      actorId,
      'cliente.deleted',
      id,
      snapshot,
      null,
    );
  }
}
