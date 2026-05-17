import { Inject, Injectable } from '@nestjs/common';
import {
  ITimeRepository,
  TIME_REPOSITORY,
} from '../../domain/repositories/time-repository.interface';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class DeleteTimeUseCase {
  constructor(
    @Inject(TIME_REPOSITORY) private readonly timeRepository: ITimeRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const time = await this.timeRepository.findById(id);
    if (!time) {
      throw new DomainError('Time não encontrado.', 'TIME_NOT_FOUND');
    }
    await this.timeRepository.delete(id);
  }
}
