import { FindUsuarioByEmailUseCase } from '../../application/use-cases/find-usuario-by-email.use-case';
import { IUsuarioRepository } from '../../domain/repositories/usuario-repository.interface';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';

const makeMockRepo = (): jest.Mocked<IUsuarioRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

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

describe('FindUsuarioByEmailUseCase', () => {
  it('returns the usuario when found by email', async () => {
    const repo = makeMockRepo();
    repo.findByEmail.mockResolvedValue(existing);
    const useCase = new FindUsuarioByEmailUseCase(repo);

    const result = await useCase.execute('maria@example.com');
    expect(result).toBe(existing);
    expect(repo.findByEmail).toHaveBeenCalledWith('maria@example.com');
  });

  it('throws USER_NOT_FOUND when not found', async () => {
    const repo = makeMockRepo();
    repo.findByEmail.mockResolvedValue(null);
    const useCase = new FindUsuarioByEmailUseCase(repo);

    await expect(useCase.execute('ghost@example.com')).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
    });
  });
});
