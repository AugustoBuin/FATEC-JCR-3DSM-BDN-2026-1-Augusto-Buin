import { CreateLeadUseCase } from '../../application/use-cases/create-lead.use-case';
import { ILeadRepository } from '../../domain/repositories/lead-repository.interface';
import { ILojaRepository } from '@/modules/lojas/domain/repositories/loja-repository.interface';
import { ITimeRepository } from '@/modules/times/domain/repositories/time-repository.interface';
import { IClienteRepository } from '@/modules/clientes/domain/repositories/cliente-repository.interface';
import { IUsuarioRepository } from '@/modules/usuarios/domain/repositories/usuario-repository.interface';
import { LojaEntity } from '@/modules/lojas/domain/entities/loja.entity';
import { TimeEntity } from '@/modules/times/domain/entities/time.entity';
import { ClienteEntity } from '@/modules/clientes/domain/entities/cliente.entity';
import { UsuarioEntity } from '@/modules/usuarios/domain/entities/usuario.entity';
import { LogService } from '@/modules/logs/application/log.service';

const LOJA_ID = '10000000-0000-4000-8000-000000000001';
const TEAM_ID = '20000000-0000-4000-8000-000000000002';
const CLIENT_ID = '30000000-0000-4000-8000-000000000003';
const USER_ID = '40000000-0000-4000-8000-000000000004';
const ACTOR_ID = '99000000-0000-4000-8000-000000000099';

const makeMockLeadRepo = (): jest.Mocked<ILeadRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  updateDenormalized: jest.fn(),
});

const makeMockLojaRepo = (): jest.Mocked<ILojaRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeMockTimeRepo = (): jest.Mocked<ITimeRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeMockClienteRepo = (): jest.Mocked<IClienteRepository> => ({
  findById: jest.fn(),
  findByPhone: jest.fn(),
  findByCpf: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeMockUsuarioRepo = (): jest.Mocked<IUsuarioRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockLogService = {
  record: jest.fn().mockResolvedValue(undefined),
} as unknown as LogService;

const mockLoja = LojaEntity.restore({ name: 'Loja A', city: 'SP' }, LOJA_ID);
const mockTime = TimeEntity.restore(
  { name: 'Time A', lojaId: LOJA_ID },
  TEAM_ID,
);
const mockCliente = ClienteEntity.restore(
  { name: 'João', phone: '5511987654321', email: 'joao@example.com' },
  CLIENT_ID,
);
const mockUsuario = UsuarioEntity.restore(
  {
    name: 'Ana',
    email: 'ana@example.com',
    role: 'atendente',
    passwordHash: 'h',
    teamId: null,
  },
  USER_ID,
);

const dto = {
  teamId: TEAM_ID,
  lojaId: LOJA_ID,
  clientId: CLIENT_ID,
  userId: USER_ID,
  source: 'WhatsApp' as const,
  subject: 'Interesse em veículo',
};

describe('CreateLeadUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates and saves a lead when all FKs are valid', async () => {
    const leadRepo = makeMockLeadRepo();
    const lojaRepo = makeMockLojaRepo();
    const timeRepo = makeMockTimeRepo();
    const clienteRepo = makeMockClienteRepo();
    const usuarioRepo = makeMockUsuarioRepo();
    lojaRepo.findById.mockResolvedValue(mockLoja);
    timeRepo.findById.mockResolvedValue(mockTime);
    clienteRepo.findById.mockResolvedValue(mockCliente);
    usuarioRepo.findById.mockResolvedValue(mockUsuario);
    leadRepo.save.mockResolvedValue(undefined);

    const useCase = new CreateLeadUseCase(
      leadRepo,
      lojaRepo,
      timeRepo,
      clienteRepo,
      usuarioRepo,
      mockLogService,
    );
    const result = await useCase.execute(dto, ACTOR_ID);

    expect(result.source).toBe('WhatsApp');
    expect(result.subject).toBe('Interesse em veículo');
    expect(result.currentStatus).toBeNull();
    expect(leadRepo.save).toHaveBeenCalledTimes(1);
    expect(mockLogService.record).toHaveBeenCalledWith(
      ACTOR_ID,
      'lead.created',
      result.id,
      null,
      expect.objectContaining({ subject: 'Interesse em veículo' }),
    );
  });

  it('throws LOJA_NOT_FOUND when loja does not exist', async () => {
    const leadRepo = makeMockLeadRepo();
    const lojaRepo = makeMockLojaRepo();
    const timeRepo = makeMockTimeRepo();
    const clienteRepo = makeMockClienteRepo();
    const usuarioRepo = makeMockUsuarioRepo();
    lojaRepo.findById.mockResolvedValue(null);

    const useCase = new CreateLeadUseCase(
      leadRepo,
      lojaRepo,
      timeRepo,
      clienteRepo,
      usuarioRepo,
      mockLogService,
    );
    await expect(useCase.execute(dto, ACTOR_ID)).rejects.toMatchObject({
      code: 'LOJA_NOT_FOUND',
    });
  });

  it('throws TIME_NOT_FOUND when team does not exist', async () => {
    const leadRepo = makeMockLeadRepo();
    const lojaRepo = makeMockLojaRepo();
    const timeRepo = makeMockTimeRepo();
    const clienteRepo = makeMockClienteRepo();
    const usuarioRepo = makeMockUsuarioRepo();
    lojaRepo.findById.mockResolvedValue(mockLoja);
    timeRepo.findById.mockResolvedValue(null);

    const useCase = new CreateLeadUseCase(
      leadRepo,
      lojaRepo,
      timeRepo,
      clienteRepo,
      usuarioRepo,
      mockLogService,
    );
    await expect(useCase.execute(dto, ACTOR_ID)).rejects.toMatchObject({
      code: 'TIME_NOT_FOUND',
    });
  });

  it('throws CLIENTE_NOT_FOUND when cliente does not exist', async () => {
    const leadRepo = makeMockLeadRepo();
    const lojaRepo = makeMockLojaRepo();
    const timeRepo = makeMockTimeRepo();
    const clienteRepo = makeMockClienteRepo();
    const usuarioRepo = makeMockUsuarioRepo();
    lojaRepo.findById.mockResolvedValue(mockLoja);
    timeRepo.findById.mockResolvedValue(mockTime);
    clienteRepo.findById.mockResolvedValue(null);

    const useCase = new CreateLeadUseCase(
      leadRepo,
      lojaRepo,
      timeRepo,
      clienteRepo,
      usuarioRepo,
      mockLogService,
    );
    await expect(useCase.execute(dto, ACTOR_ID)).rejects.toMatchObject({
      code: 'CLIENTE_NOT_FOUND',
    });
  });

  it('throws USER_NOT_FOUND when usuario does not exist', async () => {
    const leadRepo = makeMockLeadRepo();
    const lojaRepo = makeMockLojaRepo();
    const timeRepo = makeMockTimeRepo();
    const clienteRepo = makeMockClienteRepo();
    const usuarioRepo = makeMockUsuarioRepo();
    lojaRepo.findById.mockResolvedValue(mockLoja);
    timeRepo.findById.mockResolvedValue(mockTime);
    clienteRepo.findById.mockResolvedValue(mockCliente);
    usuarioRepo.findById.mockResolvedValue(null);

    const useCase = new CreateLeadUseCase(
      leadRepo,
      lojaRepo,
      timeRepo,
      clienteRepo,
      usuarioRepo,
      mockLogService,
    );
    await expect(useCase.execute(dto, ACTOR_ID)).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
    });
  });
});
