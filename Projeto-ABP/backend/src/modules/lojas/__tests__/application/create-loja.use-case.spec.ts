import { CreateLojaUseCase } from '../../application/use-cases/create-loja.use-case';
import { ILojaRepository } from '../../domain/repositories/loja-repository.interface';
import { LojaEntity } from '../../domain/entities/loja.entity';

const mockRepo = (): jest.Mocked<ILojaRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('CreateLojaUseCase', () => {
  it('creates and persists a loja, returning it', async () => {
    const repo = mockRepo();
    repo.save.mockResolvedValue(undefined);

    const useCase = new CreateLojaUseCase(repo);
    const loja = await useCase.execute({
      name: 'Loja Centro',
      city: 'São José dos Campos',
    });

    expect(loja).toBeInstanceOf(LojaEntity);
    expect(loja.name).toBe('Loja Centro');
    expect(repo.save).toHaveBeenCalledWith(loja);
  });
});
