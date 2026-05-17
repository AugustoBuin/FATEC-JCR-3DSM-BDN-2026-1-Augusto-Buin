import { FindClienteUseCase } from '../../application/use-cases/find-cliente.use-case';
import { IClienteRepository } from '../../domain/repositories/cliente-repository.interface';
import { ClienteEntity } from '../../domain/entities/cliente.entity';

const makeMockRepo = (): jest.Mocked<IClienteRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByPhone: jest.fn(),
  findByCpf: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const existing = ClienteEntity.create({
  name: 'Ana Paula',
  phone: '5511912345678',
  email: 'ana@example.com',
});

describe('FindClienteUseCase', () => {
  it('returns the cliente when found', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(existing);
    const useCase = new FindClienteUseCase(repo);

    const result = await useCase.execute(existing.id);
    expect(result).toBe(existing);
  });

  it('throws CLIENT_NOT_FOUND when not found', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new FindClienteUseCase(repo);

    await expect(useCase.execute('non-existent-id')).rejects.toMatchObject({
      code: 'CLIENT_NOT_FOUND',
    });
  });
});
