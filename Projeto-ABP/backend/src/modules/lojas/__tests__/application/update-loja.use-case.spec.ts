import { UpdateLojaUseCase } from '../../application/use-cases/update-loja.use-case';
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
  { name: 'Loja Antiga', city: 'Jacareí' },
  '123e4567-e89b-4d3c-a456-426614174000',
);

describe('UpdateLojaUseCase', () => {
  it('updates an existing loja and persists', async () => {
    const repo = mockRepo();
    const logService = makeMockLogService();
    repo.findById.mockResolvedValue(existingLoja);
    repo.save.mockResolvedValue(undefined);

    const useCase = new UpdateLojaUseCase(repo, logService);
    const loja = await useCase.execute(
      existingLoja.id,
      { name: 'Loja Nova' },
      ACTOR_ID,
    );

    expect(loja.name).toBe('Loja Nova');
    expect(loja.city).toBe('Jacareí');
    expect(repo.save).toHaveBeenCalledWith(loja);
    expect(logService.record).toHaveBeenCalledWith(
      ACTOR_ID,
      'loja.updated',
      loja.id,
      expect.any(Object),
      expect.any(Object),
    );
  });

  it('throws DomainError when loja is not found', async () => {
    const repo = mockRepo();
    const logService = makeMockLogService();
    repo.findById.mockResolvedValue(null);

    const useCase = new UpdateLojaUseCase(repo, logService);
    await expect(
      useCase.execute(
        '123e4567-e89b-4d3c-a456-426614174000',
        { name: 'X' },
        ACTOR_ID,
      ),
    ).rejects.toThrow(DomainError);
  });
});
