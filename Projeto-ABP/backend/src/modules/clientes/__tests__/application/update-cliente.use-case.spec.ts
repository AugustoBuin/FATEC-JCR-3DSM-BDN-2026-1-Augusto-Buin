import { UpdateClienteUseCase } from '../../application/use-cases/update-cliente.use-case';
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

const existing = ClienteEntity.create({
  name: 'Carlos',
  phone: '5511900000001',
  email: 'carlos@example.com',
});

describe('UpdateClienteUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updates and saves a cliente', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(existing);
    repo.findByPhone.mockResolvedValue(null);
    repo.save.mockResolvedValue(undefined);
    const useCase = new UpdateClienteUseCase(repo, mockLogService);

    const result = await useCase.execute(
      existing.id,
      { name: 'Carlos Atualizado' },
      ACTOR_ID,
    );
    expect(result.name).toBe('Carlos Atualizado');
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(mockLogService.record).toHaveBeenCalledWith(
      ACTOR_ID,
      'cliente.updated',
      existing.id,
      expect.objectContaining({ name: 'Carlos' }),
      expect.objectContaining({ name: 'Carlos Atualizado' }),
    );
  });

  it('throws CLIENT_NOT_FOUND when missing', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new UpdateClienteUseCase(repo, mockLogService);

    await expect(
      useCase.execute('non-existent-id', { name: 'X' }, ACTOR_ID),
    ).rejects.toMatchObject({
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
    const useCase = new UpdateClienteUseCase(repo, mockLogService);

    await expect(
      useCase.execute(existing.id, { phone: '5511900000002' }, ACTOR_ID),
    ).rejects.toMatchObject({ code: 'PHONE_ALREADY_EXISTS' });
  });

  it('throws CPF_ALREADY_EXISTS when updating to a taken cpf', async () => {
    const other = ClienteEntity.create({
      name: 'Other',
      phone: '5511900000002',
      email: 'other@example.com',
      cpf: '52998224725',
    });
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(existing);
    repo.findByPhone.mockResolvedValue(null);
    repo.findByCpf.mockResolvedValue(other);
    const useCase = new UpdateClienteUseCase(repo, mockLogService);

    await expect(
      useCase.execute(existing.id, { cpf: '52998224725' }, ACTOR_ID),
    ).rejects.toMatchObject({ code: 'CPF_ALREADY_EXISTS' });
  });
});
