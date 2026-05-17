import { CreateTimeUseCase } from '../../application/use-cases/create-time.use-case';
import { ITimeRepository } from '../../domain/repositories/time-repository.interface';
import { ILojaRepository } from '@/modules/lojas/domain/repositories/loja-repository.interface';
import { TimeEntity } from '../../domain/entities/time.entity';
import { LojaEntity } from '@/modules/lojas/domain/entities/loja.entity';
import { DomainError } from '@/shared/errors/domain-error';
import { LogService } from '@/modules/logs/application/log.service';

const LOJA_ID = '123e4567-e89b-4d3c-a456-426614174000';
const ACTOR_ID = '99000000-0000-4000-8000-000000000099';

const mockTimeRepo = (): jest.Mocked<ITimeRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockLojaRepo = (): jest.Mocked<ILojaRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockLogService = {
  record: jest.fn().mockResolvedValue(undefined),
} as unknown as LogService;

const existingLoja = LojaEntity.restore(
  { name: 'Loja', city: 'Cidade' },
  LOJA_ID,
);

describe('CreateTimeUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates and persists a time when loja exists', async () => {
    const timeRepo = mockTimeRepo();
    const lojaRepo = mockLojaRepo();
    lojaRepo.findById.mockResolvedValue(existingLoja);
    timeRepo.save.mockResolvedValue(undefined);

    const useCase = new CreateTimeUseCase(timeRepo, lojaRepo, mockLogService);
    const time = await useCase.execute(
      { name: 'Time Alpha', lojaId: LOJA_ID },
      ACTOR_ID,
    );

    expect(time).toBeInstanceOf(TimeEntity);
    expect(time.name).toBe('Time Alpha');
    expect(timeRepo.save).toHaveBeenCalledWith(time);
    expect(mockLogService.record).toHaveBeenCalledWith(
      ACTOR_ID,
      'time.created',
      time.id,
      null,
      { name: 'Time Alpha', lojaId: LOJA_ID },
    );
  });

  it('throws DomainError when loja does not exist', async () => {
    const timeRepo = mockTimeRepo();
    const lojaRepo = mockLojaRepo();
    lojaRepo.findById.mockResolvedValue(null);

    const useCase = new CreateTimeUseCase(timeRepo, lojaRepo, mockLogService);
    await expect(
      useCase.execute({ name: 'Time Alpha', lojaId: LOJA_ID }, ACTOR_ID),
    ).rejects.toThrow(DomainError);
  });
});
