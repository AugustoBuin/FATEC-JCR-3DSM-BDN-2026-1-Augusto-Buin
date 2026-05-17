import { DeleteLeadUseCase } from '../../application/use-cases/delete-lead.use-case';
import { ILeadRepository } from '../../domain/repositories/lead-repository.interface';
import { LeadEntity } from '../../domain/entities/lead.entity';
import { LogService } from '@/modules/logs/application/log.service';

const LEAD_ID = '10000000-0000-4000-8000-000000000001';
const ACTOR_ID = '99000000-0000-4000-8000-000000000099';

const makeMockRepo = (): jest.Mocked<ILeadRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  updateDenormalized: jest.fn(),
});

const mockLogService = {
  record: jest.fn().mockResolvedValue(undefined),
} as unknown as LogService;

const existing = LeadEntity.restore(
  {
    teamId: '20000000-0000-4000-8000-000000000002',
    lojaId: '30000000-0000-4000-8000-000000000003',
    clientId: '40000000-0000-4000-8000-000000000004',
    userId: '50000000-0000-4000-8000-000000000005',
    source: 'Instagram',
    subject: 'Lead a deletar',
    currentStatus: null,
    currentImportance: null,
  },
  LEAD_ID,
);

describe('DeleteLeadUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deletes the lead when it exists', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(existing);
    repo.delete.mockResolvedValue(undefined);
    const useCase = new DeleteLeadUseCase(repo, mockLogService);

    await useCase.execute(LEAD_ID, ACTOR_ID);
    expect(repo.delete).toHaveBeenCalledWith(LEAD_ID);
    expect(mockLogService.record).toHaveBeenCalledWith(
      ACTOR_ID,
      'lead.deleted',
      LEAD_ID,
      expect.objectContaining({ subject: 'Lead a deletar' }),
      null,
    );
  });

  it('throws LEAD_NOT_FOUND when lead does not exist', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new DeleteLeadUseCase(repo, mockLogService);

    await expect(useCase.execute('bad-id', ACTOR_ID)).rejects.toMatchObject({
      code: 'LEAD_NOT_FOUND',
    });
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
