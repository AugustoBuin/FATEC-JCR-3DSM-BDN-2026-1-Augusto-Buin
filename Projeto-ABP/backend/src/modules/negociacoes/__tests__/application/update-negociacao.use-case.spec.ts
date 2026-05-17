import { UpdateNegociacaoUseCase } from '../../application/use-cases/update-negociacao.use-case';
import { INegociacaoRepository } from '../../domain/repositories/negociacao-repository.interface';
import { ILeadRepository } from '@/modules/leads/domain/repositories/lead-repository.interface';
import { NegociacaoEntity } from '../../domain/entities/negociacao.entity';
import { LogService } from '@/modules/logs/application/log.service';

const LEAD_ID = '10000000-0000-4000-8000-000000000001';
const NEG_ID = '30000000-0000-4000-8000-000000000003';
const USER_ID = '20000000-0000-4000-8000-000000000002';

const makeMockNegRepo = (): jest.Mocked<INegociacaoRepository> => ({
  findById: jest.fn(),
  findByLeadId: jest.fn(),
  findOpenByLeadId: jest.fn(),
  save: jest.fn(),
});

const makeMockLeadRepo = (): jest.Mocked<ILeadRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  updateDenormalized: jest.fn(),
});

const mockLogService = {
  record: jest.fn().mockResolvedValue(undefined),
} as unknown as LogService;

const makeOpenNeg = () =>
  NegociacaoEntity.restore(
    {
      leadId: LEAD_ID,
      status: 'contato inicial',
      importance: 'frio',
      isOpen: true,
      motivoEncerramento: null,
      historico: [],
    },
    NEG_ID,
  );

describe('UpdateNegociacaoUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updates status and importance, records historico, and syncs lead', async () => {
    const negRepo = makeMockNegRepo();
    const leadRepo = makeMockLeadRepo();
    negRepo.findById.mockResolvedValue(makeOpenNeg());
    negRepo.save.mockResolvedValue(undefined);
    leadRepo.updateDenormalized.mockResolvedValue(undefined);

    const useCase = new UpdateNegociacaoUseCase(
      negRepo,
      leadRepo,
      mockLogService,
    );
    const result = await useCase.execute(
      NEG_ID,
      { status: 'em negociação', importance: 'morno', notes: 'Progresso' },
      USER_ID,
    );

    expect(result.status).toBe('em negociação');
    expect(result.importance).toBe('morno');
    expect(result.historico).toHaveLength(1);
    expect(result.historico[0].previousStatus).toBe('contato inicial');
    expect(result.historico[0].changedBy).toBe(USER_ID);
    expect(leadRepo.updateDenormalized).toHaveBeenCalledWith(
      LEAD_ID,
      'em negociação',
      'morno',
    );
    expect(mockLogService.record).toHaveBeenCalledWith(
      USER_ID,
      'negociacao.updated',
      NEG_ID,
      { status: 'contato inicial', importance: 'frio' },
      { status: 'em negociação', importance: 'morno' },
    );
  });

  it('keeps current values when status or importance are not provided', async () => {
    const negRepo = makeMockNegRepo();
    const leadRepo = makeMockLeadRepo();
    negRepo.findById.mockResolvedValue(makeOpenNeg());
    negRepo.save.mockResolvedValue(undefined);
    leadRepo.updateDenormalized.mockResolvedValue(undefined);

    const useCase = new UpdateNegociacaoUseCase(
      negRepo,
      leadRepo,
      mockLogService,
    );
    const result = await useCase.execute(
      NEG_ID,
      { notes: 'Apenas uma nota' },
      USER_ID,
    );

    expect(result.status).toBe('contato inicial');
    expect(result.importance).toBe('frio');
    expect(leadRepo.updateDenormalized).toHaveBeenCalledWith(
      LEAD_ID,
      'contato inicial',
      'frio',
    );
  });

  it('returns negotiation unchanged without saving when dto is empty', async () => {
    const negRepo = makeMockNegRepo();
    const leadRepo = makeMockLeadRepo();
    negRepo.findById.mockResolvedValue(makeOpenNeg());

    const useCase = new UpdateNegociacaoUseCase(
      negRepo,
      leadRepo,
      mockLogService,
    );
    const result = await useCase.execute(NEG_ID, {}, USER_ID);

    expect(result.status).toBe('contato inicial');
    expect(negRepo.save).not.toHaveBeenCalled();
    expect(leadRepo.updateDenormalized).not.toHaveBeenCalled();
    expect(mockLogService.record).not.toHaveBeenCalled();
  });

  it('throws NEGOCIACAO_NOT_FOUND when negotiation does not exist', async () => {
    const negRepo = makeMockNegRepo();
    const leadRepo = makeMockLeadRepo();
    negRepo.findById.mockResolvedValue(null);

    const useCase = new UpdateNegociacaoUseCase(
      negRepo,
      leadRepo,
      mockLogService,
    );
    await expect(useCase.execute('bad-id', {}, USER_ID)).rejects.toMatchObject({
      code: 'NEGOCIACAO_NOT_FOUND',
    });
  });

  it('throws NEGOTIATION_ALREADY_CLOSED when negotiation is closed', async () => {
    const closedNeg = NegociacaoEntity.restore(
      {
        leadId: LEAD_ID,
        status: 'fechado - não vendido',
        importance: 'frio',
        isOpen: false,
        motivoEncerramento: 'Não interessou.',
        historico: [],
      },
      NEG_ID,
    );
    const negRepo = makeMockNegRepo();
    const leadRepo = makeMockLeadRepo();
    negRepo.findById.mockResolvedValue(closedNeg);

    const useCase = new UpdateNegociacaoUseCase(
      negRepo,
      leadRepo,
      mockLogService,
    );
    await expect(
      useCase.execute(NEG_ID, { status: 'em negociação' }, USER_ID),
    ).rejects.toMatchObject({
      code: 'NEGOTIATION_ALREADY_CLOSED',
    });
  });
});
