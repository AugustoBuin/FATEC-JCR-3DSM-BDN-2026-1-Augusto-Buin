import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ListLogsUseCase } from '../../application/use-cases/list-logs.use-case';
import { FindLogUseCase } from '../../application/use-cases/find-log.use-case';
import { LogFilters } from '../../domain/repositories/log-repository.interface';
import { LogEntity, EventType } from '../../domain/entities/log.entity';
import { Roles } from '@/shared/auth/roles.decorator';

@Controller('logs')
export class LogsController {
  constructor(
    private readonly listLogs: ListLogsUseCase,
    private readonly findLog: FindLogUseCase,
  ) {}

  @Get()
  @Roles('admin')
  async list(
    @Query('userId') userId?: string,
    @Query('eventType') eventType?: string,
    @Query('targetId') targetId?: string,
  ) {
    const filters: LogFilters = {};
    if (userId) filters.userId = userId;
    if (eventType) filters.eventType = eventType as EventType;
    if (targetId) filters.targetId = targetId;

    const logs = await this.listLogs.execute(filters);
    return logs.map((l) => this.toResponse(l));
  }

  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    const log = await this.findLog.execute(id);
    if (!log) throw new NotFoundException('Log não encontrado.');
    return this.toResponse(log);
  }

  private toResponse(log: LogEntity) {
    return {
      id: log.id,
      userId: log.userId,
      eventType: log.eventType,
      targetId: log.targetId,
      before: log.before,
      after: log.after,
      createdAt: log.createdAt,
    };
  }
}
