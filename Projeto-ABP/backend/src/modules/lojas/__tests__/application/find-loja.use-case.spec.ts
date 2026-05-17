import { FindLojaUseCase } from '../../application/use-cases/find-loja.use-case';
import { ILojaRepository } from '../../domain/repositories/loja-repository.interface';
import { LojaEntity } from '../../domain/entities/loja.entity';

const mockRepo = (): jest.Mocked<ILojaRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const existing = LojaEntity.restore(
  { name: 'Loja Centro', city: 'São José dos Campos' },
  '123e4567-e89b-4d3c-a456-426614174000',
);

describe('FindLojaUseCase', () => {
  it('returns the loja when found', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(existing);
    const useCase = new FindLojaUseCase(repo);

    const result = await useCase.execute(existing.id);
    expect(result).toBe(existing);
  });

  it('throws LOJA_NOT_FOUND when not found', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new FindLojaUseCase(repo);

    await expect(useCase.execute('non-existent-id')).rejects.toMatchObject({
      code: 'LOJA_NOT_FOUND',
    });
  });
});
