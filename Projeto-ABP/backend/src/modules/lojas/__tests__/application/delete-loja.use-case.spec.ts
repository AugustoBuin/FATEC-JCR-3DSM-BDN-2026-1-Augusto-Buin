import { DeleteLojaUseCase } from '../../application/use-cases/delete-loja.use-case';
import { ILojaRepository } from '../../domain/repositories/loja-repository.interface';
import { LojaEntity } from '../../domain/entities/loja.entity';
import { DomainError } from '@/shared/errors/domain-error';
import { LogService } from '@/modules/logs/application/log.service';

const mockRepo = (): jest.Mocked<ILojaRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeMockLogService = (): jest.Mocked<LogService> =>
  ({
    record: jest.fn().mockResolvedValue(undefined),
  }) as unknown as jest.Mocked<LogService>;

const ACTOR_ID = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';

const existingLoja = LojaEntity.restore(
  { name: 'Loja', city: 'Cidade' },
  '123e4567-e89b-4d3c-a456-426614174000',
);

describe('DeleteLojaUseCase', () => {
  it('deletes an existing loja', async () => {
    const repo = mockRepo();
    const logService = makeMockLogService();
    repo.findById.mockResolvedValue(existingLoja);
    repo.delete.mockResolvedValue(undefined);

    const useCase = new DeleteLojaUseCase(repo, logService);
    await useCase.execute(existingLoja.id, ACTOR_ID);

    expect(repo.delete).toHaveBeenCalledWith(existingLoja.id);
    expect(logService.record).toHaveBeenCalledWith(
      ACTOR_ID,
      'loja.deleted',
      existingLoja.id,
      expect.any(Object),
      null,
    );
  });

  it('throws DomainError when loja is not found', async () => {
    const repo = mockRepo();
    const logService = makeMockLogService();
    repo.findById.mockResolvedValue(null);

    const useCase = new DeleteLojaUseCase(repo, logService);
    await expect(
      useCase.execute('123e4567-e89b-4d3c-a456-426614174000', ACTOR_ID),
    ).rejects.toThrow(DomainError);
  });
});
