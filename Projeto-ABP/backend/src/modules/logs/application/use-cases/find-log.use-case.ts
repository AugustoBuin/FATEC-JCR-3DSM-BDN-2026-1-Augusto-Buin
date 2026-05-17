import { Inject, Injectable } from '@nestjs/common';
import { LogEntity } from '../../domain/entities/log.entity';
import {
  ILogRepository,
  LOG_REPOSITORY,
} from '../../domain/repositories/log-repository.interface';

@Injectable()
export class FindLogUseCase {
  constructor(
    @Inject(LOG_REPOSITORY)
    private readonly logRepository: ILogRepository,
  ) {}

  async execute(id: string): Promise<LogEntity | null> {
    return this.logRepository.findById(id);
  }
}
