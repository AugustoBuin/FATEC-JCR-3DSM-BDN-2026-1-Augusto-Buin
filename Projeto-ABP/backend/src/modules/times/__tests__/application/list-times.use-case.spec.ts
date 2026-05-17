import { ListTimesUseCase } from '../../application/use-cases/list-times.use-case';
import { ITimeRepository } from '../../domain/repositories/time-repository.interface';
import { TimeEntity } from '../../domain/entities/time.entity';

const VALID_LOJA_ID = '123e4567-e89b-4d3c-a456-426614174000';

const mockRepo = (): jest.Mocked<ITimeRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('ListTimesUseCase', () => {
  it('returns all times when no filter provided', async () => {
    const times = [
      TimeEntity.restore(
        { name: 'Time A', lojaId: VALID_LOJA_ID },
        '223e4567-e89b-4d3c-a456-426614174001',
      ),
      TimeEntity.restore(
        { name: 'Time B', lojaId: VALID_LOJA_ID },
        '323e4567-e89b-4d3c-a456-426614174002',
      ),
    ];
    const repo = mockRepo();
    repo.findAll.mockResolvedValue(times);
    const useCase = new ListTimesUseCase(repo);

    const result = await useCase.execute();
    expect(result).toHaveLength(2);
    expect(repo.findAll).toHaveBeenCalledWith(undefined);
  });

  it('passes lojaId filter to repository', async () => {
    const repo = mockRepo();
    repo.findAll.mockResolvedValue([]);
    const useCase = new ListTimesUseCase(repo);

    await useCase.execute(VALID_LOJA_ID);
    expect(repo.findAll).toHaveBeenCalledWith(VALID_LOJA_ID);
  });
});
