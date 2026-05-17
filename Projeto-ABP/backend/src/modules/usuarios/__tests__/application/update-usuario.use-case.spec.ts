jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcryptjs';
import { UpdateUsuarioUseCase } from '../../application/use-cases/update-usuario.use-case';
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
    passwordHash: 'old-hash',
    teamId: null,
  },
  '123e4567-e89b-4d3c-a456-426614174000',
);

describe('UpdateUsuarioUseCase', () => {
  it('updates name without touching password', async () => {
    const repo = makeMockRepo();
    const logService = makeMockLogService();
    repo.findById.mockResolvedValue(existing);
    repo.save.mockResolvedValue(undefined);
    const useCase = new UpdateUsuarioUseCase(repo, logService);

    const result = await useCase.execute(
      existing.id,
      { name: 'Maria Atualizada' },
      ACTOR_ID,
    );
    expect(result.name).toBe('Maria Atualizada');
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(logService.record).toHaveBeenCalledWith(
      ACTOR_ID,
      'usuario.updated',
      existing.id,
      expect.any(Object),
      expect.any(Object),
    );
  });

  it('hashes and updates password when provided', async () => {
    const repo = makeMockRepo();
    const logService = makeMockLogService();
    repo.findById.mockResolvedValue(existing);
    repo.save.mockResolvedValue(undefined);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
    const useCase = new UpdateUsuarioUseCase(repo, logService);

    const result = await useCase.execute(
      existing.id,
      { password: 'newpass1' },
      ACTOR_ID,
    );
    expect(result.passwordHash).toBe('new-hash');
    expect(bcrypt.hash).toHaveBeenCalledWith('newpass1', 10);
  });

  it('throws USER_NOT_FOUND when usuario does not exist', async () => {
    const repo = makeMockRepo();
    const logService = makeMockLogService();
    repo.findById.mockResolvedValue(null);
    const useCase = new UpdateUsuarioUseCase(repo, logService);

    await expect(
      useCase.execute('bad-id', { name: 'X' }, ACTOR_ID),
    ).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
    });
  });

  it('throws EMAIL_ALREADY_EXISTS when updating to a taken email', async () => {
    const other = UsuarioEntity.restore(
      {
        name: 'Other',
        email: 'other@example.com',
        role: 'atendente',
        passwordHash: 'h',
        teamId: null,
      },
      '223e4567-e89b-4d3c-a456-426614174001',
    );
    const repo = makeMockRepo();
    const logService = makeMockLogService();
    repo.findById.mockResolvedValue(existing);
    repo.findByEmail.mockResolvedValue(other);
    const useCase = new UpdateUsuarioUseCase(repo, logService);

    await expect(
      useCase.execute(existing.id, { email: 'other@example.com' }, ACTOR_ID),
    ).rejects.toMatchObject({ code: 'EMAIL_ALREADY_EXISTS' });
  });

  it('does NOT throw when updating email to same value with different casing', async () => {
    const repo = makeMockRepo();
    const logService = makeMockLogService();
    repo.findById.mockResolvedValue(existing);
    repo.findByEmail.mockResolvedValue(existing);
    repo.save.mockResolvedValue(undefined);
    const useCase = new UpdateUsuarioUseCase(repo, logService);

    await expect(
      useCase.execute(existing.id, { email: 'MARIA@example.com' }, ACTOR_ID),
    ).resolves.toBeDefined();
  });

  it('clears teamId when explicitly set to null', async () => {
    const withTeam = UsuarioEntity.restore(
      {
        name: 'Maria',
        email: 'maria@example.com',
        role: 'atendente',
        passwordHash: 'h',
        teamId: '223e4567-e89b-4d3c-a456-426614174001',
      },
      '123e4567-e89b-4d3c-a456-426614174000',
    );
    const repo = makeMockRepo();
    const logService = makeMockLogService();
    repo.findById.mockResolvedValue(withTeam);
    repo.save.mockResolvedValue(undefined);
    const useCase = new UpdateUsuarioUseCase(repo, logService);

    const result = await useCase.execute(
      withTeam.id,
      { teamId: null },
      ACTOR_ID,
    );
    expect(result.teamId).toBeNull();
  });

  it('does not change teamId when omitted from dto', async () => {
    const withTeam = UsuarioEntity.restore(
      {
        name: 'Maria',
        email: 'maria@example.com',
        role: 'atendente',
        passwordHash: 'h',
        teamId: '223e4567-e89b-4d3c-a456-426614174001',
      },
      '123e4567-e89b-4d3c-a456-426614174000',
    );
    const repo = makeMockRepo();
    const logService = makeMockLogService();
    repo.findById.mockResolvedValue(withTeam);
    repo.save.mockResolvedValue(undefined);
    const useCase = new UpdateUsuarioUseCase(repo, logService);

    const result = await useCase.execute(
      withTeam.id,
      { name: 'Maria Nova' },
      ACTOR_ID,
    );
    expect(result.teamId).toBe('223e4567-e89b-4d3c-a456-426614174001');
  });
});
