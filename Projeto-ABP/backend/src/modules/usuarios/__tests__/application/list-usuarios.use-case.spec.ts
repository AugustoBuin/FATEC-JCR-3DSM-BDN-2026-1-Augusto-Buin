import { ListUsuariosUseCase } from '../../application/use-cases/list-usuarios.use-case';
import { IUsuarioRepository } from '../../domain/repositories/usuario-repository.interface';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';

const makeMockRepo = (): jest.Mocked<IUsuarioRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('ListUsuariosUseCase', () => {
  it('returns all usuarios', async () => {
    const usuarios = [
      UsuarioEntity.restore(
        {
          name: 'A',
          email: 'a@x.com',
          role: 'admin',
          passwordHash: 'h',
          teamId: null,
        },
        '123e4567-e89b-4d3c-a456-426614174000',
      ),
      UsuarioEntity.restore(
        {
          name: 'B',
          email: 'b@x.com',
          role: 'atendente',
          passwordHash: 'h',
          teamId: null,
        },
        '223e4567-e89b-4d3c-a456-426614174001',
      ),
    ];
    const repo = makeMockRepo();
    repo.findAll.mockResolvedValue(usuarios);
    const useCase = new ListUsuariosUseCase(repo);

    const result = await useCase.execute();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('A');
  });

  it('returns empty array when no usuarios exist', async () => {
    const repo = makeMockRepo();
    repo.findAll.mockResolvedValue([]);
    const useCase = new ListUsuariosUseCase(repo);

    expect(await useCase.execute()).toEqual([]);
  });
});
