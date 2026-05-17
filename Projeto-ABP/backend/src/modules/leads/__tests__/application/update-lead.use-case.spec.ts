import { UpdateLeadUseCase } from '../../application/use-cases/update-lead.use-case';
import { ILeadRepository } from '../../domain/repositories/lead-repository.interface';
import { ITimeRepository } from '@/modules/times/domain/repositories/time-repository.interface';
import { IUsuarioRepository } from '@/modules/usuarios/domain/repositories/usuario-repository.interface';
import { LeadEntity } from '../../domain/entities/lead.entity';
import { TimeEntity } from '@/modules/times/domain/entities/time.entity';
import { UsuarioEntity } from '@/modules/usuarios/domain/entities/usuario.entity';
import { LogService } from '@/modules/logs/application/log.service';

const LEAD_ID = '10000000-0000-4000-8000-000000000001';
const TEAM_ID = '20000000-0000-4000-8000-000000000002';
const LOJA_ID = '30000000-0000-4000-8000-000000000003';
const USER_ID = '50000000-0000-4000-8000-000000000005';
const ACTOR_ID = '99000000-0000-4000-8000-000000000099';

const makeMockLeadRepo = (): jest.Mocked<ILeadRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  updateDenormalized: jest.fn(),
});
const makeMockTimeRepo = (): jest.Mocked<ITimeRepository> => ({
  findById: jest.fn(),
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

const makeExisting = () =>
  LeadEntity.restore(
    {
      teamId: TEAM_ID,
      lojaId: LOJA_ID,
      clientId: '40000000-0000-4000-8000-000000000004',
      userId: USER_ID,
      source: 'Telefone',
      subject: 'Interesse original',
      currentStatus: null,
      currentImportance: null,
    },
    LEAD_ID,
  );

describe('UpdateLeadUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updates subject without validating FKs when they are not changing', async () => {
    const leadRepo = makeMockLeadRepo();
    const timeRepo = makeMockTimeRepo();
    const usuarioRepo = makeMockUsuarioRepo();
    leadRepo.findById.mockResolvedValue(makeExisting());
    leadRepo.save.mockResolvedValue(undefined);

    const useCase = new UpdateLeadUseCase(
      leadRepo,
      timeRepo,
      usuarioRepo,
      mockLogService,
    );
    const result = await useCase.execute(
      LEAD_ID,
      { subject: 'Novo assunto' },
      ACTOR_ID,
    );
    expect(result.subject).toBe('Novo assunto');
    expect(timeRepo.findById).not.toHaveBeenCalled();
    expect(usuarioRepo.findById).not.toHaveBeenCalled();
    expect(mockLogService.record).toHaveBeenCalledWith(
      ACTOR_ID,
      'lead.updated',
      LEAD_ID,
      expect.objectContaining({ subject: 'Interesse original' }),
      expect.objectContaining({ subject: 'Novo assunto' }),
    );
  });

  it('validates new teamId when provided', async () => {
    const leadRepo = makeMockLeadRepo();
    const timeRepo = makeMockTimeRepo();
    const usuarioRepo = makeMockUsuarioRepo();
    leadRepo.findById.mockResolvedValue(makeExisting());
    timeRepo.findById.mockResolvedValue(null);

    const useCase = new UpdateLeadUseCase(
      leadRepo,
      timeRepo,
      usuarioRepo,
      mockLogService,
    );
    await expect(
      useCase.execute(
        LEAD_ID,
        { teamId: '99000000-0000-4000-8000-000000000099' },
        ACTOR_ID,
      ),
    ).rejects.toMatchObject({ code: 'TIME_NOT_FOUND' });
  });

  it('validates new userId when provided', async () => {
    const leadRepo = makeMockLeadRepo();
    const timeRepo = makeMockTimeRepo();
    const usuarioRepo = makeMockUsuarioRepo();
    leadRepo.findById.mockResolvedValue(makeExisting());
    usuarioRepo.findById.mockResolvedValue(null);

    const useCase = new UpdateLeadUseCase(
      leadRepo,
      timeRepo,
      usuarioRepo,
      mockLogService,
    );
    await expect(
      useCase.execute(
        LEAD_ID,
        { userId: '99000000-0000-4000-8000-000000000099' },
        ACTOR_ID,
      ),
    ).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });
  });

  it('throws LEAD_NOT_FOUND when lead does not exist', async () => {
    const leadRepo = makeMockLeadRepo();
    const timeRepo = makeMockTimeRepo();
    const usuarioRepo = makeMockUsuarioRepo();
    leadRepo.findById.mockResolvedValue(null);

    const useCase = new UpdateLeadUseCase(
      leadRepo,
      timeRepo,
      usuarioRepo,
      mockLogService,
    );
    await expect(
      useCase.execute('bad-id', { subject: 'x' }, ACTOR_ID),
    ).rejects.toMatchObject({
      code: 'LEAD_NOT_FOUND',
    });
  });

  it('updates teamId and userId when valid entities exist', async () => {
    const newTeam = TimeEntity.restore(
      { name: 'Time B', lojaId: LOJA_ID },
      '20000000-0000-4000-8000-000000000099',
    );
    const newUser = UsuarioEntity.restore(
      {
        name: 'Bruno',
        email: 'bruno@example.com',
        role: 'atendente',
        passwordHash: 'h',
        teamId: null,
      },
      '50000000-0000-4000-8000-000000000099',
    );
    const leadRepo = makeMockLeadRepo();
    const timeRepo = makeMockTimeRepo();
    const usuarioRepo = makeMockUsuarioRepo();
    leadRepo.findById.mockResolvedValue(makeExisting());
    leadRepo.save.mockResolvedValue(undefined);
    timeRepo.findById.mockResolvedValue(newTeam);
    usuarioRepo.findById.mockResolvedValue(newUser);

    const useCase = new UpdateLeadUseCase(
      leadRepo,
      timeRepo,
      usuarioRepo,
      mockLogService,
    );
    const result = await useCase.execute(
      LEAD_ID,
      {
        teamId: '20000000-0000-4000-8000-000000000099',
        userId: '50000000-0000-4000-8000-000000000099',
      },
      ACTOR_ID,
    );
    expect(result.teamId).toBe('20000000-0000-4000-8000-000000000099');
    expect(result.userId).toBe('50000000-0000-4000-8000-000000000099');
  });
});
