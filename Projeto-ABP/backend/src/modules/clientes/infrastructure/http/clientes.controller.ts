import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import { CreateClienteUseCase } from '../../application/use-cases/create-cliente.use-case';
import { FindClienteUseCase } from '../../application/use-cases/find-cliente.use-case';
import { ListClientesUseCase } from '../../application/use-cases/list-clientes.use-case';
import { UpdateClienteUseCase } from '../../application/use-cases/update-cliente.use-case';
import { DeleteClienteUseCase } from '../../application/use-cases/delete-cliente.use-case';
import { createClienteSchema, CreateClienteDto } from '../../application/dtos/create-cliente.dto';
import { updateClienteSchema, UpdateClienteDto } from '../../application/dtos/update-cliente.dto';
import { ClienteEntity } from '../../domain/entities/cliente.entity';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { DomainError } from '@/shared/errors/domain-error';

@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly createCliente: CreateClienteUseCase,
    private readonly findCliente: FindClienteUseCase,
    private readonly listClientes: ListClientesUseCase,
    private readonly updateCliente: UpdateClienteUseCase,
    private readonly deleteCliente: DeleteClienteUseCase,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createClienteSchema))
  async create(@Body() dto: CreateClienteDto) {
    const cliente = await this.createCliente.execute(dto);
    return this.toResponse(cliente);
  }

  @Get()
  async list(@Query('phone') phone?: string, @Query('cpf') cpf?: string) {
    const clientes = await this.listClientes.execute({ phone, cpf });
    return clientes.map((c) => this.toResponse(c));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return this.toResponse(await this.findCliente.execute(id));
    } catch (e) {
      if (e instanceof DomainError && e.code === 'CLIENT_NOT_FOUND') {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateClienteSchema)) dto: UpdateClienteDto,
  ) {
    try {
      return this.toResponse(await this.updateCliente.execute(id, dto));
    } catch (e) {
      if (e instanceof DomainError && e.code === 'CLIENT_NOT_FOUND') {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.deleteCliente.execute(id);
    } catch (e) {
      if (e instanceof DomainError && e.code === 'CLIENT_NOT_FOUND') {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  private toResponse(cliente: ClienteEntity) {
    return {
      id: cliente.id,
      name: cliente.name,
      phone: cliente.phone,
      email: cliente.email,
      cpf: cliente.cpf,
      address: cliente.address,
    };
  }
}
