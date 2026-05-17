import { DeleteLojaUseCase } from '../../application/use-cases/delete-loja.use-case';
import { ILojaRepository } from '../../domain/repositories/loja-repository.interface';
import { LojaEntity } from '../../domain/entities/loja.entity';
import { DomainError } from '@/shared/errors/domain-error';

const mockRepo = (): jest.Mocked<ILojaRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const existingLoja = LojaEntity.restore(
  { name: 'Loja', city: 'Cidade' },
  '123e4567-e89b-4d3c-a456-426614174000',
);

describe('DeleteLojaUseCase', () => {
  it('deletes an existing loja', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(existingLoja);
    repo.delete.mockResolvedValue(undefined);

    const useCase = new DeleteLojaUseCase(repo);
    await useCase.execute(existingLoja.id);

    expect(repo.delete).toHaveBeenCalledWith(existingLoja.id);
  });

  it('throws DomainError when loja is not found', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);

    const useCase = new DeleteLojaUseCase(repo);
    await expect(
      useCase.execute('123e4567-e89b-4d3c-a456-426614174000'),
    ).rejects.toThrow(DomainError);
  });
});
