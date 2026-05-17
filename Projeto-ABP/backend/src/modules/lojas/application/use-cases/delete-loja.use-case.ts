import { Inject, Injectable } from '@nestjs/common';
import {
  ILojaRepository,
  LOJA_REPOSITORY,
} from '../../domain/repositories/loja-repository.interface';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class DeleteLojaUseCase {
  constructor(
    @Inject(LOJA_REPOSITORY) private readonly lojaRepository: ILojaRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const loja = await this.lojaRepository.findById(id);
    if (!loja) {
      throw new DomainError('Loja não encontrada.', 'LOJA_NOT_FOUND');
    }
    await this.lojaRepository.delete(id);
  }
}
