import { OpenNegociacaoUseCase } from '../../application/use-cases/open-negociacao.use-case';
import { INegociacaoRepository } from '../../domain/repositories/negociacao-repository.interface';
import { ILeadRepository } from '@/modules/leads/domain/repositories/lead-repository.interface';
import { LeadEntity } from '@/modules/leads/domain/entities/lead.entity';
import { NegociacaoEntity } from '../../domain/entities/negociacao.entity';
import { LogService } from '@/modules/logs/application/log.service';

const LEAD_ID = '10000000-0000-4000-8000-000000000001';
const NEG_ID = '30000000-0000-4000-8000-000000000003';
const ACTOR_ID = '99000000-0000-4000-8000-000000000099';

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

const existingLead = LeadEntity.restore(
  {
    teamId: '20000000-0000-4000-8000-000000000002',
    lojaId: '30000000-0000-4000-8000-000000000003',
    clientId: '40000000-0000-4000-8000-000000000004',
    userId: '50000000-0000-4000-8000-000000000005',
    source: 'WhatsApp',
    subject: 'Veículo',
    currentStatus: null,
    currentImportance: null,
  },
  LEAD_ID,
);

const dto = {
  leadId: LEAD_ID,
  status: 'contato inicial' as const,
  importance: 'frio' as const,
};

describe('OpenNegociacaoUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('opens a negotiation and syncs lead denormalized fields', async () => {
    const negRepo = makeMockNegRepo();
    const leadRepo = makeMockLeadRepo();
    leadRepo.findById.mockResolvedValue(existingLead);
    negRepo.findOpenByLeadId.mockResolvedValue(null);
    negRepo.save.mockResolvedValue(undefined);
    leadRepo.updateDenormalized.mockResolvedValue(undefined);

    const useCase = new OpenNegociacaoUseCase(
      negRepo,
      leadRepo,
      mockLogService,
    );
    const result = await useCase.execute(dto, ACTOR_ID);

    expect(result.isOpen).toBe(true);
    expect(result.status).toBe('contato inicial');
    expect(negRepo.save).toHaveBeenCalledTimes(1);
    expect(leadRepo.updateDenormalized).toHaveBeenCalledWith(
      LEAD_ID,
      'contato inicial',
      'frio',
    );
    expect(mockLogService.record).toHaveBeenCalledWith(
      ACTOR_ID,
      'negociacao.created',
      result.id,
      null,
      expect.objectContaining({ leadId: LEAD_ID, status: 'contato inicial' }),
    );
  });

  it('throws LEAD_NOT_FOUND when lead does not exist', async () => {
    const negRepo = makeMockNegRepo();
    const leadRepo = makeMockLeadRepo();
    leadRepo.findById.mockResolvedValue(null);

    const useCase = new OpenNegociacaoUseCase(
      negRepo,
      leadRepo,
      mockLogService,
    );
    await expect(useCase.execute(dto, ACTOR_ID)).rejects.toMatchObject({
      code: 'LEAD_NOT_FOUND',
    });
  });

  it('throws NEGOTIATION_ALREADY_OPEN when an open negotiation exists', async () => {
    const existingNeg = NegociacaoEntity.restore(
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
    const negRepo = makeMockNegRepo();
    const leadRepo = makeMockLeadRepo();
    leadRepo.findById.mockResolvedValue(existingLead);
    negRepo.findOpenByLeadId.mockResolvedValue(existingNeg);

    const useCase = new OpenNegociacaoUseCase(
      negRepo,
      leadRepo,
      mockLogService,
    );
    await expect(useCase.execute(dto, ACTOR_ID)).rejects.toMatchObject({
      code: 'NEGOTIATION_ALREADY_OPEN',
    });
    expect(negRepo.save).not.toHaveBeenCalled();
  });
});
