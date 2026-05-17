import { Inject, Injectable } from '@nestjs/common';
import { TimeEntity } from '../../domain/entities/time.entity';
import {
  ITimeRepository,
  TIME_REPOSITORY,
} from '../../domain/repositories/time-repository.interface';
import {
  ILojaRepository,
  LOJA_REPOSITORY,
} from '@/modules/lojas/domain/repositories/loja-repository.interface';
import { DomainError } from '@/shared/errors/domain-error';
import { CreateTimeDto } from '../dtos/create-time.dto';

@Injectable()
export class CreateTimeUseCase {
  constructor(
    @Inject(TIME_REPOSITORY) private readonly timeRepository: ITimeRepository,
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
  ) {}

  async execute(dto: CreateTimeDto): Promise<TimeEntity> {
    const loja = await this.lojaRepository.findById(dto.lojaId);
    if (!loja) {
      throw new DomainError('Loja não encontrada.', 'LOJA_NOT_FOUND');
    }
    const time = TimeEntity.create(dto);
    await this.timeRepository.save(time);
    return time;
  }
}
