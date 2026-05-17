import { Inject, Injectable } from '@nestjs/common';
import { LojaEntity } from '../../domain/entities/loja.entity';
import {
  ILojaRepository,
  LOJA_REPOSITORY,
} from '../../domain/repositories/loja-repository.interface';
import { DomainError } from '@/shared/errors/domain-error';
import { UpdateLojaDto } from '../dtos/update-loja.dto';

@Injectable()
export class UpdateLojaUseCase {
  constructor(
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
  ) {}

  async execute(id: string, dto: UpdateLojaDto): Promise<LojaEntity> {
    const loja = await this.lojaRepository.findById(id);
    if (!loja) {
      throw new DomainError('Loja não encontrada.', 'LOJA_NOT_FOUND');
    }
    loja.update(dto);
    await this.lojaRepository.save(loja);
    return loja;
  }
}
