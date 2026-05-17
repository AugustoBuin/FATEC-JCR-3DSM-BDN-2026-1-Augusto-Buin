import { Inject, Injectable } from '@nestjs/common';
import { TimeEntity } from '../../domain/entities/time.entity';
import {
  ITimeRepository,
  TIME_REPOSITORY,
} from '../../domain/repositories/time-repository.interface';

@Injectable()
export class ListTimesUseCase {
  constructor(
    @Inject(TIME_REPOSITORY) private readonly timeRepository: ITimeRepository,
  ) {}

  async execute(lojaId?: string): Promise<TimeEntity[]> {
    return this.timeRepository.findAll(lojaId);
  }
}
