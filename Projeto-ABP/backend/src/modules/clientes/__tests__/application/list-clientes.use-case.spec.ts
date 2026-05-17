import { ListClientesUseCase } from '../../application/use-cases/list-clientes.use-case';
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

describe('ListClientesUseCase', () => {
  it('returns all clientes with no filters', async () => {
    const clientes = [
      ClienteEntity.create({
        name: 'A',
        phone: '5511900000001',
        email: 'a@test.com',
      }),
      ClienteEntity.create({
        name: 'B',
        phone: '5511900000002',
        email: 'b@test.com',
      }),
    ];
    const repo = makeMockRepo();
    repo.findAll.mockResolvedValue(clientes);
    const useCase = new ListClientesUseCase(repo);

    const result = await useCase.execute();
    expect(result).toHaveLength(2);
    expect(repo.findAll).toHaveBeenCalledWith(undefined);
  });

  it('passes phone filter to repository', async () => {
    const repo = makeMockRepo();
    repo.findAll.mockResolvedValue([]);
    const useCase = new ListClientesUseCase(repo);

    await useCase.execute({ phone: '5511900000001' });
    expect(repo.findAll).toHaveBeenCalledWith({ phone: '5511900000001' });
  });
});
