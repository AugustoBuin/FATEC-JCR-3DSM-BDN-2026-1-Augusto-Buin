import { ListLojasUseCase } from '../../application/use-cases/list-lojas.use-case';
import { ILojaRepository } from '../../domain/repositories/loja-repository.interface';
import { LojaEntity } from '../../domain/entities/loja.entity';

const mockRepo = (): jest.Mocked<ILojaRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('ListLojasUseCase', () => {
  it('returns all lojas', async () => {
    const lojas = [
      LojaEntity.restore(
        { name: 'Loja A', city: 'Cidade A' },
        '123e4567-e89b-4d3c-a456-426614174000',
      ),
      LojaEntity.restore(
        { name: 'Loja B', city: 'Cidade B' },
        '223e4567-e89b-4d3c-a456-426614174001',
      ),
    ];
    const repo = mockRepo();
    repo.findAll.mockResolvedValue(lojas);
    const useCase = new ListLojasUseCase(repo);

    const result = await useCase.execute();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Loja A');
  });

  it('returns empty array when no lojas exist', async () => {
    const repo = mockRepo();
    repo.findAll.mockResolvedValue([]);
    const useCase = new ListLojasUseCase(repo);

    const result = await useCase.execute();
    expect(result).toEqual([]);
  });
});
