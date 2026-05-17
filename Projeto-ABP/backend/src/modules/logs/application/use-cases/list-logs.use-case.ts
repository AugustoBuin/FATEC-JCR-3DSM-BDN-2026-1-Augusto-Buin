import { Inject, Injectable } from '@nestjs/common';
import { LogEntity } from '../../domain/entities/log.entity';
import {
  ILogRepository,
  LOG_REPOSITORY,
  LogFilters,
} from '../../domain/repositories/log-repository.interface';

@Injectable()
export class ListLogsUseCase {
  constructor(
    @Inject(LOG_REPOSITORY)
    private readonly logRepository: ILogRepository,
  ) {}

  async execute(filters?: LogFilters): Promise<LogEntity[]> {
    return this.logRepository.findAll(filters);
  }
}
