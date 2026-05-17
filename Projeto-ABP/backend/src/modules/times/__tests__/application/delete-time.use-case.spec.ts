import { DeleteTimeUseCase } from '../../application/use-cases/delete-time.use-case';
import { ITimeRepository } from '../../domain/repositories/time-repository.interface';
import { TimeEntity } from '../../domain/entities/time.entity';
import { DomainError } from '@/shared/errors/domain-error';
import { LogService } from '@/modules/logs/application/log.service';

const ACTOR_ID = '99000000-0000-4000-8000-000000000099';

const mockTimeRepo = (): jest.Mocked<ITimeRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockLogService = {
  record: jest.fn().mockResolvedValue(undefined),
} as unknown as LogService;

const existingTime = TimeEntity.restore(
  { name: 'Time', lojaId: '123e4567-e89b-4d3c-a456-426614174000' },
  '223e4567-e89b-4d3c-a456-426614174001',
);

describe('DeleteTimeUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deletes an existing time', async () => {
    const repo = mockTimeRepo();
    repo.findById.mockResolvedValue(existingTime);
    repo.delete.mockResolvedValue(undefined);

    const useCase = new DeleteTimeUseCase(repo, mockLogService);
    await useCase.execute(existingTime.id, ACTOR_ID);

    expect(repo.delete).toHaveBeenCalledWith(existingTime.id);
    expect(mockLogService.record).toHaveBeenCalledWith(
      ACTOR_ID,
      'time.deleted',
      existingTime.id,
      expect.objectContaining({ name: 'Time' }),
      null,
    );
  });

  it('throws DomainError when time is not found', async () => {
    const repo = mockTimeRepo();
    repo.findById.mockResolvedValue(null);

    const useCase = new DeleteTimeUseCase(repo, mockLogService);
    await expect(
      useCase.execute('223e4567-e89b-4d3c-a456-426614174001', ACTOR_ID),
    ).rejects.toThrow(DomainError);
  });
});
