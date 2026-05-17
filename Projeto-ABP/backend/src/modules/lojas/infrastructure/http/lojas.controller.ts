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
  @UsePipes(new ZodValidationPipe(createLojaSchema))
  async create(@Body() dto: CreateLojaDto) {
    const loja = await this.createLoja.execute(dto);
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
    } catch (e) {
      if (e instanceof DomainError && e.code === 'LOJA_NOT_FOUND') {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLojaSchema)) dto: UpdateLojaDto,
  ) {
    try {
      const loja = await this.updateLoja.execute(id, dto);
      return this.toResponse(loja);
    } catch (e) {
      if (e instanceof DomainError && e.code === 'LOJA_NOT_FOUND') {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.deleteLoja.execute(id);
    } catch (e) {
      if (e instanceof DomainError && e.code === 'LOJA_NOT_FOUND') {
        throw new NotFoundException(e.message);
      }
      throw e;
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
