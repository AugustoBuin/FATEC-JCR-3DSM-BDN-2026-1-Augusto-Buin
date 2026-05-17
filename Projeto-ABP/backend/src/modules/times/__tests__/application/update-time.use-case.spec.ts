import { UpdateTimeUseCase } from '../../application/use-cases/update-time.use-case';
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
  { name: 'Time Antigo', lojaId: '123e4567-e89b-4d3c-a456-426614174000' },
  '223e4567-e89b-4d3c-a456-426614174001',
);

describe('UpdateTimeUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updates an existing time and persists', async () => {
    const repo = mockTimeRepo();
    repo.findById.mockResolvedValue(existingTime);
    repo.save.mockResolvedValue(undefined);

    const useCase = new UpdateTimeUseCase(repo, mockLogService);
    const time = await useCase.execute(
      existingTime.id,
      { name: 'Time Novo' },
      ACTOR_ID,
    );

    expect(time.name).toBe('Time Novo');
    expect(repo.save).toHaveBeenCalledWith(time);
    expect(mockLogService.record).toHaveBeenCalledWith(
      ACTOR_ID,
      'time.updated',
      existingTime.id,
      expect.objectContaining({ name: 'Time Antigo' }),
      expect.objectContaining({ name: 'Time Novo' }),
    );
  });

  it('throws DomainError when time is not found', async () => {
    const repo = mockTimeRepo();
    repo.findById.mockResolvedValue(null);

    const useCase = new UpdateTimeUseCase(repo, mockLogService);
    await expect(
      useCase.execute(
        '223e4567-e89b-4d3c-a456-426614174001',
        { name: 'X' },
        ACTOR_ID,
      ),
    ).rejects.toThrow(DomainError);
  });
});
