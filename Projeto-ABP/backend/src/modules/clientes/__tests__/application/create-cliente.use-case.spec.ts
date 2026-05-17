import { CreateClienteUseCase } from '../../application/use-cases/create-cliente.use-case';
import { IClienteRepository } from '../../domain/repositories/cliente-repository.interface';
import { DomainError } from '@/shared/errors/domain-error';
import { ClienteEntity } from '../../domain/entities/cliente.entity';
import { LogService } from '@/modules/logs/application/log.service';

const makeMockRepo = (): jest.Mocked<IClienteRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByPhone: jest.fn(),
  findByCpf: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockLogService = {
  record: jest.fn().mockResolvedValue(undefined),
} as unknown as LogService;

const ACTOR_ID = '99000000-0000-4000-8000-000000000099';

const validInput = {
  name: 'Ana Paula',
  phone: '5511912345678',
  email: 'ana@example.com',
};

describe('CreateClienteUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates and saves a cliente', async () => {
    const repo = makeMockRepo();
    repo.findByPhone.mockResolvedValue(null);
    repo.save.mockResolvedValue(undefined);
    const useCase = new CreateClienteUseCase(repo, mockLogService);

    const result = await useCase.execute(validInput, ACTOR_ID);

    expect(result).toBeInstanceOf(ClienteEntity);
    expect(result.name).toBe('Ana Paula');
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(mockLogService.record).toHaveBeenCalledWith(
      ACTOR_ID,
      'cliente.created',
      result.id,
      null,
      expect.objectContaining({ name: 'Ana Paula' }),
    );
  });

  it('throws PHONE_ALREADY_EXISTS when phone is taken', async () => {
    const repo = makeMockRepo();
    repo.findByPhone.mockResolvedValue(ClienteEntity.create(validInput));
    const useCase = new CreateClienteUseCase(repo, mockLogService);

    await expect(useCase.execute(validInput, ACTOR_ID)).rejects.toThrow(
      DomainError,
    );
    await expect(useCase.execute(validInput, ACTOR_ID)).rejects.toMatchObject({
      code: 'PHONE_ALREADY_EXISTS',
    });
  });

  it('throws CPF_ALREADY_EXISTS when cpf is taken', async () => {
    const repo = makeMockRepo();
    repo.findByPhone.mockResolvedValue(null);
    repo.findByCpf.mockResolvedValue(
      ClienteEntity.create({ ...validInput, cpf: '52998224725' }),
    );
    const useCase = new CreateClienteUseCase(repo, mockLogService);

    await expect(
      useCase.execute(
        { ...validInput, phone: '5511912345679', cpf: '52998224725' },
        ACTOR_ID,
      ),
    ).rejects.toMatchObject({ code: 'CPF_ALREADY_EXISTS' });
  });
});
