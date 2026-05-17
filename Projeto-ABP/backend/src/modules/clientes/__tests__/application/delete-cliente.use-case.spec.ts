import { DeleteClienteUseCase } from '../../application/use-cases/delete-cliente.use-case';
import { IClienteRepository } from '../../domain/repositories/cliente-repository.interface';
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
  name: 'Lucia',
  phone: '5511900000003',
  email: 'lucia@example.com',
});

describe('DeleteClienteUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deletes an existing cliente', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(existing);
    repo.delete.mockResolvedValue();
    const useCase = new DeleteClienteUseCase(repo, mockLogService);

    await expect(
      useCase.execute(existing.id, ACTOR_ID),
    ).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith(existing.id);
    expect(mockLogService.record).toHaveBeenCalledWith(
      ACTOR_ID,
      'cliente.deleted',
      existing.id,
      expect.objectContaining({ name: 'Lucia' }),
      null,
    );
  });

  it('throws CLIENT_NOT_FOUND when missing', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new DeleteClienteUseCase(repo, mockLogService);

    await expect(useCase.execute('missing-id', ACTOR_ID)).rejects.toMatchObject(
      {
        code: 'CLIENT_NOT_FOUND',
      },
    );
  });
});
