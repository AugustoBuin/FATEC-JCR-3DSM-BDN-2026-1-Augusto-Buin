import { CreateLojaUseCase } from '../../application/use-cases/create-loja.use-case';
import { ILojaRepository } from '../../domain/repositories/loja-repository.interface';
import { LojaEntity } from '../../domain/entities/loja.entity';
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

describe('CreateLojaUseCase', () => {
  it('creates and persists a loja, returning it', async () => {
    const repo = mockRepo();
    const logService = makeMockLogService();
    repo.save.mockResolvedValue(undefined);

    const useCase = new CreateLojaUseCase(repo, logService);
    const loja = await useCase.execute(
      { name: 'Loja Centro', city: 'São José dos Campos' },
      ACTOR_ID,
    );

    expect(loja).toBeInstanceOf(LojaEntity);
    expect(loja.name).toBe('Loja Centro');
    expect(repo.save).toHaveBeenCalledWith(loja);
    expect(logService.record).toHaveBeenCalledWith(
      ACTOR_ID,
      'loja.created',
      loja.id,
      null,
      expect.any(Object),
    );
  });
});
