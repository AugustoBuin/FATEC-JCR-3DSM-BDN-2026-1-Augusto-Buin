jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcryptjs';
import { CreateUsuarioUseCase } from '../../application/use-cases/create-usuario.use-case';
import { IUsuarioRepository } from '../../domain/repositories/usuario-repository.interface';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { DomainError } from '@/shared/errors/domain-error';
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

const validDto = {
  name: 'Maria Admin',
  email: 'maria@example.com',
  password: 'senha123',
  role: 'admin' as const,
  teamId: null,
};

describe('CreateUsuarioUseCase', () => {
  it('creates, hashes password and saves a usuario', async () => {
    const repo = makeMockRepo();
    const logService = makeMockLogService();
    repo.findByEmail.mockResolvedValue(null);
    repo.save.mockResolvedValue(undefined);
    const useCase = new CreateUsuarioUseCase(repo, logService);

    const result = await useCase.execute(validDto, ACTOR_ID);

    expect(result).toBeInstanceOf(UsuarioEntity);
    expect(result.name).toBe('Maria Admin');
    expect(result.passwordHash).toBe('hashed-password');
    expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 10);
    expect(repo.save).toHaveBeenCalledWith(result);
    expect(logService.record).toHaveBeenCalledWith(
      ACTOR_ID,
      'usuario.created',
      result.id,
      null,
      expect.any(Object),
    );
  });

  it('throws EMAIL_ALREADY_EXISTS when email is taken', async () => {
    const repo = makeMockRepo();
    const logService = makeMockLogService();
    repo.findByEmail.mockResolvedValue(
      UsuarioEntity.create({ ...validDto, passwordHash: 'x' }),
    );
    const useCase = new CreateUsuarioUseCase(repo, logService);

    await expect(useCase.execute(validDto, ACTOR_ID)).rejects.toMatchObject({
      code: 'EMAIL_ALREADY_EXISTS',
    });
    expect(repo.save).not.toHaveBeenCalled();
    expect(logService.record).not.toHaveBeenCalled();
  });
});
