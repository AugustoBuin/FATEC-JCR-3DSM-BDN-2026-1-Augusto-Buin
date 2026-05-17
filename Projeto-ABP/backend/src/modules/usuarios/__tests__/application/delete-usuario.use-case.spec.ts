import { DeleteUsuarioUseCase } from '../../application/use-cases/delete-usuario.use-case';
import { IUsuarioRepository } from '../../domain/repositories/usuario-repository.interface';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { LogService } from '@/modules/logs/application/log.service';

const makeMockRepo = (): jest.Mocked<IUsuarioRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeMockLogService = (): jest.Mocked<LogService> =>
  ({
    record: jest.fn().mockResolvedValue(undefined),
  }) as unknown as jest.Mocked<LogService>;

const ACTOR_ID = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';

const existing = UsuarioEntity.restore(
  {
    name: 'Maria',
    email: 'maria@example.com',
    role: 'admin',
    passwordHash: 'h',
    teamId: null,
  },
  '123e4567-e89b-4d3c-a456-426614174000',
);

describe('DeleteUsuarioUseCase', () => {
  it('deletes the usuario when found', async () => {
    const repo = makeMockRepo();
    const logService = makeMockLogService();
    repo.findById.mockResolvedValue(existing);
    repo.delete.mockResolvedValue(undefined);
    const useCase = new DeleteUsuarioUseCase(repo, logService);

    await useCase.execute(existing.id, ACTOR_ID);
    expect(repo.delete).toHaveBeenCalledWith(existing.id);
    expect(logService.record).toHaveBeenCalledWith(
      ACTOR_ID,
      'usuario.deleted',
      existing.id,
      expect.any(Object),
      null,
    );
  });

  it('throws USER_NOT_FOUND when not found', async () => {
    const repo = makeMockRepo();
    const logService = makeMockLogService();
    repo.findById.mockResolvedValue(null);
    const useCase = new DeleteUsuarioUseCase(repo, logService);

    await expect(
      useCase.execute('non-existent', ACTOR_ID),
    ).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
    });
    expect(repo.delete).not.toHaveBeenCalled();
    expect(logService.record).not.toHaveBeenCalled();
  });
});
