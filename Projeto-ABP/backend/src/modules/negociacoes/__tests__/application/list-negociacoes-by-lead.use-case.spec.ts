import { ListNegociacoesByLeadUseCase } from '../../application/use-cases/list-negociacoes-by-lead.use-case';
import { INegociacaoRepository } from '../../domain/repositories/negociacao-repository.interface';
import { NegociacaoEntity } from '../../domain/entities/negociacao.entity';

const LEAD_ID = '10000000-0000-4000-8000-000000000001';
const NEG_ID = '30000000-0000-4000-8000-000000000003';

const makeMockRepo = (): jest.Mocked<INegociacaoRepository> => ({
  findById: jest.fn(),
  findByLeadId: jest.fn(),
  findOpenByLeadId: jest.fn(),
  save: jest.fn(),
});

const neg = NegociacaoEntity.restore(
  {
    leadId: LEAD_ID,
    status: 'contato inicial',
    importance: 'frio',
    isOpen: false,
    motivoEncerramento: 'Encerrado.',
    historico: [],
  },
  NEG_ID,
);

describe('ListNegociacoesByLeadUseCase', () => {
  it('returns all negotiations for a lead', async () => {
    const repo = makeMockRepo();
    repo.findByLeadId.mockResolvedValue([neg]);
    const useCase = new ListNegociacoesByLeadUseCase(repo);

    const result = await useCase.execute(LEAD_ID);
    expect(result).toHaveLength(1);
    expect(repo.findByLeadId).toHaveBeenCalledWith(LEAD_ID);
  });

  it('returns empty array when no negotiations exist', async () => {
    const repo = makeMockRepo();
    repo.findByLeadId.mockResolvedValue([]);
    const useCase = new ListNegociacoesByLeadUseCase(repo);

    const result = await useCase.execute(LEAD_ID);
    expect(result).toEqual([]);
  });
});
