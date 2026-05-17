import { UpdateClienteUseCase } from '../../application/use-cases/update-cliente.use-case';
import { IClienteRepository } from '../../domain/repositories/cliente-repository.interface';
import { DomainError } from '@/shared/errors/domain-error';
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
  name: 'Carlos',
  phone: '5511900000001',
  email: 'carlos@example.com',
});

describe('UpdateClienteUseCase', () => {
  it('updates and saves a cliente', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(existing);
    repo.findByPhone.mockResolvedValue(null);
    repo.save.mockResolvedValue();
    const useCase = new UpdateClienteUseCase(repo);

    const result = await useCase.execute(existing.id, { name: 'Carlos Atualizado' });
    expect(result.name).toBe('Carlos Atualizado');
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('throws CLIENT_NOT_FOUND when missing', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new UpdateClienteUseCase(repo);

    await expect(useCase.execute('non-existent-id', { name: 'X' })).rejects.toMatchObject({
      code: 'CLIENT_NOT_FOUND',
    });
  });

  it('throws PHONE_ALREADY_EXISTS when updating to a taken phone', async () => {
    const other = ClienteEntity.create({
      name: 'Other',
      phone: '5511900000002',
      email: 'other@example.com',
    });
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(existing);
    repo.findByPhone.mockResolvedValue(other);
    const useCase = new UpdateClienteUseCase(repo);

    await expect(
      useCase.execute(existing.id, { phone: '5511900000002' }),
    ).rejects.toMatchObject({ code: 'PHONE_ALREADY_EXISTS' });
  });
});
