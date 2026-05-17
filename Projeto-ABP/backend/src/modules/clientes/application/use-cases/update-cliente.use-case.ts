import { Inject, Injectable } from '@nestjs/common';
import {
  IClienteRepository,
  CLIENTE_REPOSITORY,
} from '../../domain/repositories/cliente-repository.interface';
import { ClienteEntity } from '../../domain/entities/cliente.entity';
import { UpdateClienteDto } from '../dtos/update-cliente.dto';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class UpdateClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(id: string, dto: UpdateClienteDto): Promise<ClienteEntity> {
    const cliente = await this.clienteRepository.findById(id);
    if (!cliente) {
      throw new DomainError('Cliente não encontrado.', 'CLIENT_NOT_FOUND');
    }

    if (dto.phone && dto.phone !== cliente.phone) {
      const existing = await this.clienteRepository.findByPhone(dto.phone);
      if (existing) {
        throw new DomainError('Telefone já cadastrado.', 'PHONE_ALREADY_EXISTS');
      }
    }

    if (dto.cpf && dto.cpf !== cliente.cpf) {
      const existing = await this.clienteRepository.findByCpf(dto.cpf);
      if (existing) {
        throw new DomainError('CPF já cadastrado.', 'CPF_ALREADY_EXISTS');
      }
    }

    cliente.update(dto);
    await this.clienteRepository.save(cliente);
    return cliente;
  }
}
