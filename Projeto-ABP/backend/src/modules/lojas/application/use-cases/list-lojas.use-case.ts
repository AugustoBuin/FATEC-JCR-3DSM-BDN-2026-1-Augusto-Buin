import { Inject, Injectable } from '@nestjs/common';
import { LojaEntity } from '../../domain/entities/loja.entity';
import {
  ILojaRepository,
  LOJA_REPOSITORY,
} from '../../domain/repositories/loja-repository.interface';

@Injectable()
export class ListLojasUseCase {
  constructor(
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
  ) {}

  async execute(): Promise<LojaEntity[]> {
    return this.lojaRepository.findAll();
  }
}
