import { Inject, Injectable } from '@nestjs/common';
import { LojaEntity } from '../../domain/entities/loja.entity';
import {
  ILojaRepository,
  LOJA_REPOSITORY,
} from '../../domain/repositories/loja-repository.interface';
import { CreateLojaDto } from '../dtos/create-loja.dto';

@Injectable()
export class CreateLojaUseCase {
  constructor(
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
  ) {}

  async execute(dto: CreateLojaDto): Promise<LojaEntity> {
    const loja = LojaEntity.create(dto);
    await this.lojaRepository.save(loja);
    return loja;
  }
}
