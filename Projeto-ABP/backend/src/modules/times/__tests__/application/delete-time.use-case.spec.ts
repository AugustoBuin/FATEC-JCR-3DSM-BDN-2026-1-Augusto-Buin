import { DeleteTimeUseCase } from '../../application/use-cases/delete-time.use-case';
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
  { name: 'Time', lojaId: '123e4567-e89b-4d3c-a456-426614174000' },
  '223e4567-e89b-4d3c-a456-426614174001',
);

describe('DeleteTimeUseCase', () => {
  it('deletes an existing time', async () => {
    const repo = mockTimeRepo();
    repo.findById.mockResolvedValue(existingTime);
    repo.delete.mockResolvedValue(undefined);

    const useCase = new DeleteTimeUseCase(repo);
    await useCase.execute(existingTime.id);

    expect(repo.delete).toHaveBeenCalledWith(existingTime.id);
  });

  it('throws DomainError when time is not found', async () => {
    const repo = mockTimeRepo();
    repo.findById.mockResolvedValue(null);

    const useCase = new DeleteTimeUseCase(repo);
    await expect(
      useCase.execute('223e4567-e89b-4d3c-a456-426614174001'),
    ).rejects.toThrow(DomainError);
  });
});
