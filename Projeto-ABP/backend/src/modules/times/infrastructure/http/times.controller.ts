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
import { createTimeSchema, CreateTimeDto } from '../../application/dtos/create-time.dto';
import { updateTimeSchema, UpdateTimeDto } from '../../application/dtos/update-time.dto';
import { TimeEntity } from '../../domain/entities/time.entity';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { DomainError } from '@/shared/errors/domain-error';

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
  @UsePipes(new ZodValidationPipe(createTimeSchema))
  async create(@Body() dto: CreateTimeDto) {
    const time = await this.createTime.execute(dto);
    return this.toResponse(time);
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
    } catch (e) {
      if (e instanceof DomainError && e.code === 'TIME_NOT_FOUND') {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTimeSchema)) dto: UpdateTimeDto,
  ) {
    try {
      return this.toResponse(await this.updateTime.execute(id, dto));
    } catch (e) {
      if (e instanceof DomainError && e.code === 'TIME_NOT_FOUND') {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.deleteTime.execute(id);
    } catch (e) {
      if (e instanceof DomainError && e.code === 'TIME_NOT_FOUND') {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  private toResponse(time: TimeEntity) {
    return { id: time.id, name: time.name, lojaId: time.lojaId };
  }
}
