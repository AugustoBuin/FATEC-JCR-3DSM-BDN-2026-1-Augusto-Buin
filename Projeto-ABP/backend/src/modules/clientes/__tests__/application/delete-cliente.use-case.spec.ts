import { DeleteClienteUseCase } from '../../application/use-cases/delete-cliente.use-case';
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
  name: 'Lucia',
  phone: '5511900000003',
  email: 'lucia@example.com',
});

describe('DeleteClienteUseCase', () => {
  it('deletes an existing cliente', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(existing);
    repo.delete.mockResolvedValue();
    const useCase = new DeleteClienteUseCase(repo);

    await expect(useCase.execute(existing.id)).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith(existing.id);
  });

  it('throws CLIENT_NOT_FOUND when missing', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new DeleteClienteUseCase(repo);

    await expect(useCase.execute('missing-id')).rejects.toMatchObject({
      code: 'CLIENT_NOT_FOUND',
    });
  });
});
