import { FindNegociacaoUseCase } from '../../application/use-cases/find-negociacao.use-case';
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

const existing = NegociacaoEntity.restore(
  {
    leadId: LEAD_ID,
    status: 'em negociação',
    importance: 'morno',
    isOpen: true,
    motivoEncerramento: null,
    historico: [],
  },
  NEG_ID,
);

describe('FindNegociacaoUseCase', () => {
  it('returns the negotiation when found', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(existing);
    const useCase = new FindNegociacaoUseCase(repo);

    const result = await useCase.execute(NEG_ID);
    expect(result.id).toBe(NEG_ID);
    expect(result.status).toBe('em negociação');
  });

  it('throws NEGOCIACAO_NOT_FOUND when not found', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new FindNegociacaoUseCase(repo);

    await expect(useCase.execute('bad-id')).rejects.toMatchObject({
      code: 'NEGOCIACAO_NOT_FOUND',
    });
  });
});
