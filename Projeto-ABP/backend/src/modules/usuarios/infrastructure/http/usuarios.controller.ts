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
import { CreateUsuarioUseCase } from '../../application/use-cases/create-usuario.use-case';
import { FindUsuarioUseCase } from '../../application/use-cases/find-usuario.use-case';
import { FindUsuarioByEmailUseCase } from '../../application/use-cases/find-usuario-by-email.use-case';
import { ListUsuariosUseCase } from '../../application/use-cases/list-usuarios.use-case';
import { UpdateUsuarioUseCase } from '../../application/use-cases/update-usuario.use-case';
import { DeleteUsuarioUseCase } from '../../application/use-cases/delete-usuario.use-case';
import {
  createUsuarioSchema,
  CreateUsuarioDto,
} from '../../application/dtos/create-usuario.dto';
import {
  updateUsuarioSchema,
  UpdateUsuarioDto,
} from '../../application/dtos/update-usuario.dto';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { DomainError } from '@/shared/errors/domain-error';
import { Roles } from '@/shared/auth/roles.decorator';
import { CurrentUser, JwtPayload } from '@/shared/auth/current-user.decorator';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly createUsuario: CreateUsuarioUseCase,
    private readonly findUsuario: FindUsuarioUseCase,
    private readonly findByEmail: FindUsuarioByEmailUseCase,
    private readonly listUsuarios: ListUsuariosUseCase,
    private readonly updateUsuario: UpdateUsuarioUseCase,
    private readonly deleteUsuario: DeleteUsuarioUseCase,
  ) {}

  @Post()
  @Roles('admin')
  @UsePipes(new ZodValidationPipe(createUsuarioSchema))
  async create(@Body() dto: CreateUsuarioDto, @CurrentUser() user: JwtPayload) {
    try {
      const usuario = await this.createUsuario.execute(dto, user.sub);
      return this.toResponse(usuario);
    } catch (error) {
      if (
        error instanceof DomainError &&
        error.code === 'EMAIL_ALREADY_EXISTS'
      ) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Get()
  @Roles('admin', 'gerente geral')
  async list(@Query('email') email?: string) {
    if (email) {
      try {
        const usuario = await this.findByEmail.execute(email);
        return [this.toResponse(usuario)];
      } catch (error) {
        if (error instanceof DomainError && error.code === 'USER_NOT_FOUND')
          return [];
        throw error;
      }
    }
    const usuarios = await this.listUsuarios.execute();
    return usuarios.map((u) => this.toResponse(u));
  }

  @Get(':id')
  @Roles('admin', 'gerente geral')
  async findOne(@Param('id') id: string) {
    try {
      return this.toResponse(await this.findUsuario.execute(id));
    } catch (error) {
      if (error instanceof DomainError && error.code === 'USER_NOT_FOUND') {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Put(':id')
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUsuarioSchema)) dto: UpdateUsuarioDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      return this.toResponse(
        await this.updateUsuario.execute(id, dto, user.sub),
      );
    } catch (error) {
      if (error instanceof DomainError && error.code === 'USER_NOT_FOUND') {
        throw new NotFoundException(error.message);
      }
      if (
        error instanceof DomainError &&
        error.code === 'EMAIL_ALREADY_EXISTS'
      ) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    try {
      await this.deleteUsuario.execute(id, user.sub);
    } catch (error) {
      if (error instanceof DomainError && error.code === 'USER_NOT_FOUND') {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  private toResponse(usuario: UsuarioEntity) {
    return {
      id: usuario.id,
      name: usuario.name,
      email: usuario.email,
      role: usuario.role,
      teamId: usuario.teamId,
    };
  }
}
