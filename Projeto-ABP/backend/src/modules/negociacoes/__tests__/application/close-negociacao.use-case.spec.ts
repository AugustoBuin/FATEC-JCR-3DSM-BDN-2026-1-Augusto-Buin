import { CloseNegociacaoUseCase } from '../../application/use-cases/close-negociacao.use-case';
import { INegociacaoRepository } from '../../domain/repositories/negociacao-repository.interface';
import { ILeadRepository } from '@/modules/leads/domain/repositories/lead-repository.interface';
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

const openNeg = NegociacaoEntity.restore(
  {
    leadId: LEAD_ID,
    status: 'proposta enviada',
    importance: 'quente',
    isOpen: true,
    motivoEncerramento: null,
    historico: [],
  },
  NEG_ID,
);

describe('CloseNegociacaoUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('closes the negotiation and syncs lead denormalized fields', async () => {
    const negRepo = makeMockNegRepo();
    const leadRepo = makeMockLeadRepo();
    negRepo.findById.mockResolvedValue(openNeg);
    negRepo.save.mockResolvedValue(undefined);
    leadRepo.updateDenormalized.mockResolvedValue(undefined);

    const useCase = new CloseNegociacaoUseCase(
      negRepo,
      leadRepo,
      mockLogService,
    );
    const result = await useCase.execute(
      NEG_ID,
      { motivoEncerramento: 'Cliente fechou negócio.' },
      ACTOR_ID,
    );

    expect(result.isOpen).toBe(false);
    expect(result.motivoEncerramento).toBe('Cliente fechou negócio.');
    expect(negRepo.save).toHaveBeenCalledTimes(1);
    expect(leadRepo.updateDenormalized).toHaveBeenCalledWith(
      LEAD_ID,
      'proposta enviada',
      'quente',
    );
    expect(mockLogService.record).toHaveBeenCalledWith(
      ACTOR_ID,
      'negociacao.updated',
      NEG_ID,
      { status: 'proposta enviada', importance: 'quente', isOpen: true },
      expect.objectContaining({
        isOpen: false,
        motivoEncerramento: 'Cliente fechou negócio.',
      }),
    );
  });

  it('throws NEGOCIACAO_NOT_FOUND when negotiation does not exist', async () => {
    const negRepo = makeMockNegRepo();
    const leadRepo = makeMockLeadRepo();
    negRepo.findById.mockResolvedValue(null);

    const useCase = new CloseNegociacaoUseCase(
      negRepo,
      leadRepo,
      mockLogService,
    );
    await expect(
      useCase.execute('bad-id', { motivoEncerramento: 'Encerrado.' }, ACTOR_ID),
    ).rejects.toMatchObject({ code: 'NEGOCIACAO_NOT_FOUND' });
  });

  it('throws NEGOTIATION_ALREADY_CLOSED when negotiation is already closed', async () => {
    const closedNeg = NegociacaoEntity.restore(
      {
        leadId: LEAD_ID,
        status: 'fechado - vendido',
        importance: 'quente',
        isOpen: false,
        motivoEncerramento: 'Já fechado.',
        historico: [],
      },
      NEG_ID,
    );
    const negRepo = makeMockNegRepo();
    const leadRepo = makeMockLeadRepo();
    negRepo.findById.mockResolvedValue(closedNeg);

    const useCase = new CloseNegociacaoUseCase(
      negRepo,
      leadRepo,
      mockLogService,
    );
    await expect(
      useCase.execute(
        NEG_ID,
        { motivoEncerramento: 'Tentativa dupla.' },
        ACTOR_ID,
      ),
    ).rejects.toMatchObject({ code: 'NEGOTIATION_ALREADY_CLOSED' });
  });

  it('throws INVALID_MOTIVO_ENCERRAMENTO when motivo is empty', async () => {
    const negRepo = makeMockNegRepo();
    const leadRepo = makeMockLeadRepo();
    const freshNeg = NegociacaoEntity.restore(
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
    negRepo.findById.mockResolvedValue(freshNeg);

    const useCase = new CloseNegociacaoUseCase(
      negRepo,
      leadRepo,
      mockLogService,
    );
    await expect(
      useCase.execute(NEG_ID, { motivoEncerramento: '   ' }, ACTOR_ID),
    ).rejects.toMatchObject({ code: 'INVALID_MOTIVO_ENCERRAMENTO' });
  });
});
