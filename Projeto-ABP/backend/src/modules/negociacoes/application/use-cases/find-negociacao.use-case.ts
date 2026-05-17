import { Inject, Injectable } from '@nestjs/common';
import { NegociacaoEntity } from '../../domain/entities/negociacao.entity';
import {
  INegociacaoRepository,
  NEGOCIACAO_REPOSITORY,
} from '../../domain/repositories/negociacao-repository.interface';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class FindNegociacaoUseCase {
  constructor(
    @Inject(NEGOCIACAO_REPOSITORY)
    private readonly negociacaoRepository: INegociacaoRepository,
  ) {}

  async execute(id: string): Promise<NegociacaoEntity> {
    const negociacao = await this.negociacaoRepository.findById(id);
    if (!negociacao)
      throw new DomainError(
        'Negociação não encontrada.',
        'NEGOCIACAO_NOT_FOUND',
      );
    return negociacao;
  }
}
