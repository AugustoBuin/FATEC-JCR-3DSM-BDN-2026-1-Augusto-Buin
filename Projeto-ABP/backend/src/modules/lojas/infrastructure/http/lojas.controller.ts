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
  UsePipes,
} from '@nestjs/common';
import { CreateLojaUseCase } from '../../application/use-cases/create-loja.use-case';
import { FindLojaUseCase } from '../../application/use-cases/find-loja.use-case';
import { ListLojasUseCase } from '../../application/use-cases/list-lojas.use-case';
import { UpdateLojaUseCase } from '../../application/use-cases/update-loja.use-case';
import { DeleteLojaUseCase } from '../../application/use-cases/delete-loja.use-case';
import {
  createLojaSchema,
  CreateLojaDto,
} from '../../application/dtos/create-loja.dto';
import {
  updateLojaSchema,
  UpdateLojaDto,
} from '../../application/dtos/update-loja.dto';
import { LojaEntity } from '../../domain/entities/loja.entity';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { DomainError } from '@/shared/errors/domain-error';
import { Roles } from '@/shared/auth/roles.decorator';
import { CurrentUser, JwtPayload } from '@/shared/auth/current-user.decorator';

@Controller('lojas')
export class LojasController {
  constructor(
    private readonly createLoja: CreateLojaUseCase,
    private readonly findLoja: FindLojaUseCase,
    private readonly listLojas: ListLojasUseCase,
    private readonly updateLoja: UpdateLojaUseCase,
    private readonly deleteLoja: DeleteLojaUseCase,
  ) {}

  @Post()
  @Roles('admin', 'gerente geral')
  @UsePipes(new ZodValidationPipe(createLojaSchema))
  async create(@Body() dto: CreateLojaDto, @CurrentUser() user: JwtPayload) {
    const loja = await this.createLoja.execute(dto, user.sub);
    return this.toResponse(loja);
  }

  @Get()
  async list() {
    const lojas = await this.listLojas.execute();
    return lojas.map((l) => this.toResponse(l));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const loja = await this.findLoja.execute(id);
      return this.toResponse(loja);
    } catch (error) {
      if (error instanceof DomainError && error.code === 'LOJA_NOT_FOUND') {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Put(':id')
  @Roles('admin', 'gerente geral')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLojaSchema)) dto: UpdateLojaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const loja = await this.updateLoja.execute(id, dto, user.sub);
      return this.toResponse(loja);
    } catch (error) {
      if (error instanceof DomainError && error.code === 'LOJA_NOT_FOUND') {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    try {
      await this.deleteLoja.execute(id, user.sub);
    } catch (error) {
      if (error instanceof DomainError && error.code === 'LOJA_NOT_FOUND') {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  private toResponse(loja: LojaEntity) {
    return {
      id: loja.id,
      name: loja.name,
      city: loja.city,
      address: loja.address,
      phone: loja.phone,
    };
  }
}
