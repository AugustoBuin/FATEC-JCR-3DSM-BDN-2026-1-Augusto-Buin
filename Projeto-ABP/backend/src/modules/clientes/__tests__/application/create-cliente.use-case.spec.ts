import { CreateClienteUseCase } from '../../application/use-cases/create-cliente.use-case';
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

const validInput = {
  name: 'Ana Paula',
  phone: '5511912345678',
  email: 'ana@example.com',
};

describe('CreateClienteUseCase', () => {
  it('creates and saves a cliente', async () => {
    const repo = makeMockRepo();
    repo.findByPhone.mockResolvedValue(null);
    repo.save.mockResolvedValue();
    const useCase = new CreateClienteUseCase(repo);

    const result = await useCase.execute(validInput);

    expect(result).toBeInstanceOf(ClienteEntity);
    expect(result.name).toBe('Ana Paula');
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('throws PHONE_ALREADY_EXISTS when phone is taken', async () => {
    const repo = makeMockRepo();
    repo.findByPhone.mockResolvedValue(
      ClienteEntity.create(validInput),
    );
    const useCase = new CreateClienteUseCase(repo);

    await expect(useCase.execute(validInput)).rejects.toThrow(DomainError);
    await expect(useCase.execute(validInput)).rejects.toMatchObject({
      code: 'PHONE_ALREADY_EXISTS',
    });
  });

  it('throws CPF_ALREADY_EXISTS when cpf is taken', async () => {
    const repo = makeMockRepo();
    repo.findByPhone.mockResolvedValue(null);
    repo.findByCpf.mockResolvedValue(
      ClienteEntity.create({ ...validInput, cpf: '12345678901' }),
    );
    const useCase = new CreateClienteUseCase(repo);

    await expect(
      useCase.execute({ ...validInput, phone: '5511912345679', cpf: '12345678901' }),
    ).rejects.toMatchObject({ code: 'CPF_ALREADY_EXISTS' });
  });
});
