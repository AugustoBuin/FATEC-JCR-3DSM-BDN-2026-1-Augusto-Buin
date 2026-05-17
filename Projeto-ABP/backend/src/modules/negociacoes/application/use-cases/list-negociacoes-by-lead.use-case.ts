import { Inject, Injectable } from '@nestjs/common';
import { NegociacaoEntity } from '../../domain/entities/negociacao.entity';
import {
  INegociacaoRepository,
  NEGOCIACAO_REPOSITORY,
} from '../../domain/repositories/negociacao-repository.interface';

@Injectable()
export class ListNegociacoesByLeadUseCase {
  constructor(
    @Inject(NEGOCIACAO_REPOSITORY)
    private readonly negociacaoRepository: INegociacaoRepository,
  ) {}

  async execute(leadId: string): Promise<NegociacaoEntity[]> {
    return this.negociacaoRepository.findByLeadId(leadId);
  }
}
