import { Inject, Injectable } from '@nestjs/common';
import { TimeEntity } from '../../domain/entities/time.entity';
import {
  ITimeRepository,
  TIME_REPOSITORY,
} from '../../domain/repositories/time-repository.interface';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class FindTimeUseCase {
  constructor(
    @Inject(TIME_REPOSITORY) private readonly timeRepository: ITimeRepository,
  ) {}

  async execute(id: string): Promise<TimeEntity> {
    const time = await this.timeRepository.findById(id);
    if (!time) {
      throw new DomainError('Time não encontrado.', 'TIME_NOT_FOUND');
    }
    return time;
  }
}
