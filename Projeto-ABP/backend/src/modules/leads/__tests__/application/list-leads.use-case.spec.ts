import { ListLeadsUseCase } from '../../application/use-cases/list-leads.use-case';
import { ILeadRepository } from '../../domain/repositories/lead-repository.interface';
import { LeadEntity } from '../../domain/entities/lead.entity';

const makeMockRepo = (): jest.Mocked<ILeadRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  updateDenormalized: jest.fn(),
});

const lead = LeadEntity.restore(
  {
    teamId: '20000000-0000-4000-8000-000000000002',
    lojaId: '30000000-0000-4000-8000-000000000003',
    clientId: '40000000-0000-4000-8000-000000000004',
    userId: '50000000-0000-4000-8000-000000000005',
    source: 'Facebook',
    subject: 'Consulta',
    currentStatus: null,
    currentImportance: null,
  },
  '10000000-0000-4000-8000-000000000001',
);

describe('ListLeadsUseCase', () => {
  it('returns all leads without filters', async () => {
    const repo = makeMockRepo();
    repo.findAll.mockResolvedValue([lead]);
    const useCase = new ListLeadsUseCase(repo);

    const result = await useCase.execute();
    expect(result).toHaveLength(1);
    expect(repo.findAll).toHaveBeenCalledWith(undefined);
  });

  it('passes filters to the repository', async () => {
    const repo = makeMockRepo();
    repo.findAll.mockResolvedValue([lead]);
    const useCase = new ListLeadsUseCase(repo);

    await useCase.execute({ lojaId: '30000000-0000-4000-8000-000000000003' });
    expect(repo.findAll).toHaveBeenCalledWith({
      lojaId: '30000000-0000-4000-8000-000000000003',
    });
  });

  it('returns empty array when no leads exist', async () => {
    const repo = makeMockRepo();
    repo.findAll.mockResolvedValue([]);
    const useCase = new ListLeadsUseCase(repo);

    const result = await useCase.execute();
    expect(result).toEqual([]);
  });
});
