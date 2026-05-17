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
import { CreateTimeUseCase } from '../../application/use-cases/create-time.use-case';
import { FindTimeUseCase } from '../../application/use-cases/find-time.use-case';
import { ListTimesUseCase } from '../../application/use-cases/list-times.use-case';
import { UpdateTimeUseCase } from '../../application/use-cases/update-time.use-case';
import { DeleteTimeUseCase } from '../../application/use-cases/delete-time.use-case';
import {
  createTimeSchema,
  CreateTimeDto,
} from '../../application/dtos/create-time.dto';
import {
  updateTimeSchema,
  UpdateTimeDto,
} from '../../application/dtos/update-time.dto';
import { TimeEntity } from '../../domain/entities/time.entity';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { DomainError } from '@/shared/errors/domain-error';
import { Roles } from '@/shared/auth/roles.decorator';
import { CurrentUser, JwtPayload } from '@/shared/auth/current-user.decorator';

@Controller('times')
export class TimesController {
  constructor(
    private readonly createTime: CreateTimeUseCase,
    private readonly findTime: FindTimeUseCase,
    private readonly listTimes: ListTimesUseCase,
    private readonly updateTime: UpdateTimeUseCase,
    private readonly deleteTime: DeleteTimeUseCase,
  ) {}

  @Post()
  @Roles('admin', 'gerente geral')
  @UsePipes(new ZodValidationPipe(createTimeSchema))
  async create(@Body() dto: CreateTimeDto, @CurrentUser() user: JwtPayload) {
    try {
      const time = await this.createTime.execute(dto, user.sub);
      return this.toResponse(time);
    } catch (error) {
      if (error instanceof DomainError && error.code === 'LOJA_NOT_FOUND') {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Get()
  async list(@Query('lojaId') lojaId?: string) {
    const times = await this.listTimes.execute(lojaId);
    return times.map((t) => this.toResponse(t));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return this.toResponse(await this.findTime.execute(id));
    } catch (error) {
      if (error instanceof DomainError && error.code === 'TIME_NOT_FOUND') {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Put(':id')
  @Roles('admin', 'gerente geral')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTimeSchema)) dto: UpdateTimeDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      return this.toResponse(await this.updateTime.execute(id, dto, user.sub));
    } catch (error) {
      if (error instanceof DomainError && error.code === 'TIME_NOT_FOUND') {
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
      await this.deleteTime.execute(id, user.sub);
    } catch (error) {
      if (error instanceof DomainError && error.code === 'TIME_NOT_FOUND') {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  private toResponse(time: TimeEntity) {
    return { id: time.id, name: time.name, lojaId: time.lojaId };
  }
}
