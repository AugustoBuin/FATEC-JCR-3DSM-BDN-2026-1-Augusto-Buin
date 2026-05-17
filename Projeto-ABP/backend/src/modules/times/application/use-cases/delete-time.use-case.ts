import { Inject, Injectable } from '@nestjs/common';
import {
  ITimeRepository,
  TIME_REPOSITORY,
} from '../../domain/repositories/time-repository.interface';
import { LogService } from '@/modules/logs/application/log.service';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class DeleteTimeUseCase {
  constructor(
    @Inject(TIME_REPOSITORY) private readonly timeRepository: ITimeRepository,
    private readonly logService: LogService,
  ) {}

  async execute(id: string, actorId: string): Promise<void> {
    const time = await this.timeRepository.findById(id);
    if (!time) {
      throw new DomainError('Time não encontrado.', 'TIME_NOT_FOUND');
    }
    const snapshot = { name: time.name, lojaId: time.lojaId };
    await this.timeRepository.delete(id);
    await this.logService.record(actorId, 'time.deleted', id, snapshot, null);
  }
}
