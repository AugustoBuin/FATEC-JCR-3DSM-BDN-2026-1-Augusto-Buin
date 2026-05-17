import { FindTimeUseCase } from '../../application/use-cases/find-time.use-case';
import { ITimeRepository } from '../../domain/repositories/time-repository.interface';
import { TimeEntity } from '../../domain/entities/time.entity';

const VALID_LOJA_ID = '123e4567-e89b-4d3c-a456-426614174000';

const mockRepo = (): jest.Mocked<ITimeRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const existing = TimeEntity.restore(
  { name: 'Time Alpha', lojaId: VALID_LOJA_ID },
  '223e4567-e89b-4d3c-a456-426614174001',
);

describe('FindTimeUseCase', () => {
  it('returns the time when found', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(existing);
    const useCase = new FindTimeUseCase(repo);

    const result = await useCase.execute(existing.id);
    expect(result).toBe(existing);
  });

  it('throws TIME_NOT_FOUND when not found', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new FindTimeUseCase(repo);

    await expect(useCase.execute('non-existent-id')).rejects.toMatchObject({
      code: 'TIME_NOT_FOUND',
    });
  });
});
