jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { IUsuarioRepository } from '@/modules/usuarios/domain/repositories/usuario-repository.interface';
import { UsuarioEntity } from '@/modules/usuarios/domain/entities/usuario.entity';
import { LogService } from '@/modules/logs/application/log.service';

const makeMockRepo = (): jest.Mocked<IUsuarioRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mocked-token'),
} as unknown as JwtService;

const mockLogService = {
  record: jest.fn().mockResolvedValue(undefined),
} as unknown as LogService;

const existingUsuario = UsuarioEntity.restore(
  {
    name: 'Admin',
    email: 'admin@test.com',
    role: 'admin',
    passwordHash: 'stored-hash',
    teamId: null,
  },
  '123e4567-e89b-4d3c-a456-426614174000',
);

describe('LoginUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns accessToken on valid credentials', async () => {
    const repo = makeMockRepo();
    repo.findByEmail.mockResolvedValue(existingUsuario);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const useCase = new LoginUseCase(repo, mockJwtService, mockLogService);

    const result = await useCase.execute({
      email: 'admin@test.com',
      password: 'correct-pass',
    });

    expect(result).toEqual({ accessToken: 'mocked-token' });
    expect(bcrypt.compare).toHaveBeenCalledWith('correct-pass', 'stored-hash');
    expect(mockJwtService.sign).toHaveBeenCalledWith({
      sub: existingUsuario.id,
      role: 'admin',
    });
    expect(mockLogService.record).toHaveBeenCalledWith(
      existingUsuario.id,
      'usuario.login',
      existingUsuario.id,
      null,
      { email: 'admin@test.com', role: 'admin' },
    );
  });

  it('throws INVALID_CREDENTIALS when user not found', async () => {
    const repo = makeMockRepo();
    repo.findByEmail.mockResolvedValue(null);
    const useCase = new LoginUseCase(repo, mockJwtService, mockLogService);

    await expect(
      useCase.execute({ email: 'ghost@test.com', password: 'pass' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    expect(mockLogService.record).not.toHaveBeenCalled();
  });

  it('throws INVALID_CREDENTIALS when password is wrong', async () => {
    const repo = makeMockRepo();
    repo.findByEmail.mockResolvedValue(existingUsuario);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const useCase = new LoginUseCase(repo, mockJwtService, mockLogService);

    await expect(
      useCase.execute({ email: 'admin@test.com', password: 'wrong' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    expect(mockLogService.record).not.toHaveBeenCalled();
  });
});
