import { Inject, Injectable } from '@nestjs/common';
import {
  IClienteRepository,
  CLIENTE_REPOSITORY,
} from '../../domain/repositories/cliente-repository.interface';
import { ClienteEntity } from '../../domain/entities/cliente.entity';
import { UpdateClienteDto } from '../dtos/update-cliente.dto';
import { LogService } from '@/modules/logs/application/log.service';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class UpdateClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
    private readonly logService: LogService,
  ) {}

  async execute(
    id: string,
    dto: UpdateClienteDto,
    actorId: string,
  ): Promise<ClienteEntity> {
    const cliente = await this.clienteRepository.findById(id);
    if (!cliente) {
      throw new DomainError('Cliente não encontrado.', 'CLIENT_NOT_FOUND');
    }

    if (dto.phone && dto.phone !== cliente.phone) {
      const existing = await this.clienteRepository.findByPhone(dto.phone);
      if (existing) {
        throw new DomainError(
          'Telefone já cadastrado.',
          'PHONE_ALREADY_EXISTS',
        );
      }
    }

    if (dto.cpf && dto.cpf !== cliente.cpf) {
      const existing = await this.clienteRepository.findByCpf(dto.cpf);
      if (existing) {
        throw new DomainError('CPF já cadastrado.', 'CPF_ALREADY_EXISTS');
      }
    }

    const before = {
      name: cliente.name,
      phone: cliente.phone,
      email: cliente.email,
      cpf: cliente.cpf ?? null,
      address: cliente.address ?? null,
    };
    cliente.update(dto);
    await this.clienteRepository.save(cliente);
    await this.logService.record(
      actorId,
      'cliente.updated',
      cliente.id,
      before,
      {
        name: cliente.name,
        phone: cliente.phone,
        email: cliente.email,
        cpf: cliente.cpf ?? null,
        address: cliente.address ?? null,
      },
    );
    return cliente;
  }
}
