import { NegociacaoEntity } from '../entities/negociacao.entity';

export const NEGOCIACAO_REPOSITORY = Symbol('NEGOCIACAO_REPOSITORY');

export interface INegociacaoRepository {
  findById(id: string): Promise<NegociacaoEntity | null>;
  findByLeadId(leadId: string): Promise<NegociacaoEntity[]>;
  findOpenByLeadId(leadId: string): Promise<NegociacaoEntity | null>;
  save(negociacao: NegociacaoEntity): Promise<void>;
}
