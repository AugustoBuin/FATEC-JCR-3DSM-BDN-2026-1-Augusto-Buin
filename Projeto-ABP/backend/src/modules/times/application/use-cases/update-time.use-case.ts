import { Inject, Injectable } from '@nestjs/common';
import { TimeEntity } from '../../domain/entities/time.entity';
import {
  ITimeRepository,
  TIME_REPOSITORY,
} from '../../domain/repositories/time-repository.interface';
import { DomainError } from '@/shared/errors/domain-error';
import { UpdateTimeDto } from '../dtos/update-time.dto';

@Injectable()
export class UpdateTimeUseCase {
  constructor(
    @Inject(TIME_REPOSITORY) private readonly timeRepository: ITimeRepository,
  ) {}

  async execute(id: string, dto: UpdateTimeDto): Promise<TimeEntity> {
    const time = await this.timeRepository.findById(id);
    if (!time) {
      throw new DomainError('Time não encontrado.', 'TIME_NOT_FOUND');
    }
    time.update(dto);
    await this.timeRepository.save(time);
    return time;
  }
}
