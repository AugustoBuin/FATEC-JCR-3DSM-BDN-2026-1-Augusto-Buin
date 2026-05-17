import { FindUsuarioUseCase } from '../../application/use-cases/find-usuario.use-case';
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

describe('FindUsuarioUseCase', () => {
  it('returns the usuario when found', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(existing);
    const useCase = new FindUsuarioUseCase(repo);

    const result = await useCase.execute(existing.id);
    expect(result).toBe(existing);
  });

  it('throws USER_NOT_FOUND when not found', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new FindUsuarioUseCase(repo);

    await expect(useCase.execute('non-existent')).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
    });
  });
});
