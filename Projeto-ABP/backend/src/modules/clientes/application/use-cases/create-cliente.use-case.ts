import { Inject, Injectable } from '@nestjs/common';
import {
  IClienteRepository,
  CLIENTE_REPOSITORY,
} from '../../domain/repositories/cliente-repository.interface';
import { ClienteEntity } from '../../domain/entities/cliente.entity';
import { CreateClienteDto } from '../dtos/create-cliente.dto';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class CreateClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(dto: CreateClienteDto): Promise<ClienteEntity> {
    const existing = await this.clienteRepository.findByPhone(dto.phone);
    if (existing) {
      throw new DomainError('Telefone já cadastrado.', 'PHONE_ALREADY_EXISTS');
    }

    if (dto.cpf) {
      const byCpf = await this.clienteRepository.findByCpf(dto.cpf);
      if (byCpf) {
        throw new DomainError('CPF já cadastrado.', 'CPF_ALREADY_EXISTS');
      }
    }

    const cliente = ClienteEntity.create(dto);
    await this.clienteRepository.save(cliente);
    return cliente;
  }
}
