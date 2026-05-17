import { Inject, Injectable } from '@nestjs/common';
import { TimeEntity } from '../../domain/entities/time.entity';
import {
  ITimeRepository,
  TIME_REPOSITORY,
} from '../../domain/repositories/time-repository.interface';
import { LogService } from '@/modules/logs/application/log.service';
import { DomainError } from '@/shared/errors/domain-error';
import { UpdateTimeDto } from '../dtos/update-time.dto';

@Injectable()
export class UpdateTimeUseCase {
  constructor(
    @Inject(TIME_REPOSITORY) private readonly timeRepository: ITimeRepository,
    private readonly logService: LogService,
  ) {}

  async execute(
    id: string,
    dto: UpdateTimeDto,
    actorId: string,
  ): Promise<TimeEntity> {
    const time = await this.timeRepository.findById(id);
    if (!time) {
      throw new DomainError('Time não encontrado.', 'TIME_NOT_FOUND');
    }
    const before = { name: time.name, lojaId: time.lojaId };
    time.update(dto);
    await this.timeRepository.save(time);
    await this.logService.record(actorId, 'time.updated', time.id, before, {
      name: time.name,
      lojaId: time.lojaId,
    });
    return time;
  }
}
