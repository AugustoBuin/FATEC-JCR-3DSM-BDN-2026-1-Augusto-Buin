import { UpdateTimeUseCase } from '../../application/use-cases/update-time.use-case';
import { ITimeRepository } from '../../domain/repositories/time-repository.interface';
import { TimeEntity } from '../../domain/entities/time.entity';
import { DomainError } from '@/shared/errors/domain-error';

const mockTimeRepo = (): jest.Mocked<ITimeRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const existingTime = TimeEntity.restore(
  { name: 'Time Antigo', lojaId: '123e4567-e89b-4d3c-a456-426614174000' },
  '223e4567-e89b-4d3c-a456-426614174001',
);

describe('UpdateTimeUseCase', () => {
  it('updates an existing time and persists', async () => {
    const repo = mockTimeRepo();
    repo.findById.mockResolvedValue(existingTime);
    repo.save.mockResolvedValue(undefined);

    const useCase = new UpdateTimeUseCase(repo);
    const time = await useCase.execute(existingTime.id, { name: 'Time Novo' });

    expect(time.name).toBe('Time Novo');
    expect(repo.save).toHaveBeenCalledWith(time);
  });

  it('throws DomainError when time is not found', async () => {
    const repo = mockTimeRepo();
    repo.findById.mockResolvedValue(null);

    const useCase = new UpdateTimeUseCase(repo);
    await expect(
      useCase.execute('223e4567-e89b-4d3c-a456-426614174001', { name: 'X' }),
    ).rejects.toThrow(DomainError);
  });
});
