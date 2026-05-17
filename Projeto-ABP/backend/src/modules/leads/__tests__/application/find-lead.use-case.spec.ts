import { FindLeadUseCase } from '../../application/use-cases/find-lead.use-case';
import { ILeadRepository } from '../../domain/repositories/lead-repository.interface';
import { LeadEntity } from '../../domain/entities/lead.entity';

const LEAD_ID = '10000000-0000-4000-8000-000000000001';

const makeMockRepo = (): jest.Mocked<ILeadRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  updateDenormalized: jest.fn(),
});

const existing = LeadEntity.restore(
  {
    teamId: '20000000-0000-4000-8000-000000000002',
    lojaId: '30000000-0000-4000-8000-000000000003',
    clientId: '40000000-0000-4000-8000-000000000004',
    userId: '50000000-0000-4000-8000-000000000005',
    source: 'Telefone',
    subject: 'Interesse em SUV',
    currentStatus: null,
    currentImportance: null,
  },
  LEAD_ID,
);

describe('FindLeadUseCase', () => {
  it('returns the lead when found', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(existing);
    const useCase = new FindLeadUseCase(repo);

    const result = await useCase.execute(LEAD_ID);
    expect(result.id).toBe(LEAD_ID);
    expect(result.source).toBe('Telefone');
  });

  it('throws LEAD_NOT_FOUND when lead does not exist', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new FindLeadUseCase(repo);

    await expect(useCase.execute('bad-id')).rejects.toMatchObject({
      code: 'LEAD_NOT_FOUND',
    });
  });
});
