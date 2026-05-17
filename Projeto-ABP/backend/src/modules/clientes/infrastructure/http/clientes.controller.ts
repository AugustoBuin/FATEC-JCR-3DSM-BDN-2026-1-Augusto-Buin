import {
  Body,
  Controller,
  ConflictException,
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
import {
  createClienteSchema,
  CreateClienteDto,
} from '../../application/dtos/create-cliente.dto';
import {
  updateClienteSchema,
  UpdateClienteDto,
} from '../../application/dtos/update-cliente.dto';
import { ClienteEntity } from '../../domain/entities/cliente.entity';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { DomainError } from '@/shared/errors/domain-error';
import { Roles } from '@/shared/auth/roles.decorator';
import { CurrentUser, JwtPayload } from '@/shared/auth/current-user.decorator';

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
  @Roles('admin', 'gerente geral', 'gerente de equipe')
  @UsePipes(new ZodValidationPipe(createClienteSchema))
  async create(@Body() dto: CreateClienteDto, @CurrentUser() user: JwtPayload) {
    try {
      const cliente = await this.createCliente.execute(dto, user.sub);
      return this.toResponse(cliente);
    } catch (error) {
      if (
        error instanceof DomainError &&
        (error.code === 'PHONE_ALREADY_EXISTS' ||
          error.code === 'CPF_ALREADY_EXISTS')
      ) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
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
    } catch (error) {
      if (error instanceof DomainError && error.code === 'CLIENT_NOT_FOUND') {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Put(':id')
  @Roles('admin', 'gerente geral', 'gerente de equipe')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateClienteSchema)) dto: UpdateClienteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      return this.toResponse(
        await this.updateCliente.execute(id, dto, user.sub),
      );
    } catch (error) {
      if (error instanceof DomainError && error.code === 'CLIENT_NOT_FOUND') {
        throw new NotFoundException(error.message);
      }
      if (
        error instanceof DomainError &&
        (error.code === 'PHONE_ALREADY_EXISTS' ||
          error.code === 'CPF_ALREADY_EXISTS')
      ) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Delete(':id')
  @Roles('admin', 'gerente geral')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    try {
      await this.deleteCliente.execute(id, user.sub);
    } catch (error) {
      if (error instanceof DomainError && error.code === 'CLIENT_NOT_FOUND') {
        throw new NotFoundException(error.message);
      }
      throw error;
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
