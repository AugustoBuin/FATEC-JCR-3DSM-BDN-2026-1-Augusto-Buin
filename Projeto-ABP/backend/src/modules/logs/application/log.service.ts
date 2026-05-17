import { Inject, Injectable } from '@nestjs/common';
import { LogEntity, EventType } from '../domain/entities/log.entity';
import {
  ILogRepository,
  LOG_REPOSITORY,
} from '../domain/repositories/log-repository.interface';

@Injectable()
export class LogService {
  constructor(
    @Inject(LOG_REPOSITORY)
    private readonly logRepository: ILogRepository,
  ) {}

  async record(
    userId: string,
    eventType: EventType,
    targetId: string,
    before: Record<string, unknown> | null,
    after: Record<string, unknown> | null,
  ): Promise<void> {
    const log = LogEntity.create({
      userId,
      eventType,
      targetId,
      before,
      after,
    });
    await this.logRepository.save(log);
  }
}
