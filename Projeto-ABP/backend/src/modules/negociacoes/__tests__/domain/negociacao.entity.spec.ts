import { NegociacaoEntity } from '../../domain/entities/negociacao.entity';

const LEAD_ID = '10000000-0000-4000-8000-000000000001';
const USER_ID = '20000000-0000-4000-8000-000000000002';
const NEG_ID = '30000000-0000-4000-8000-000000000003';

describe('NegociacaoEntity', () => {
  describe('open()', () => {
    it('creates an open negotiation with empty historico', () => {
      const neg = NegociacaoEntity.open({
        leadId: LEAD_ID,
        status: 'contato inicial',
        importance: 'frio',
      });
      expect(neg.leadId).toBe(LEAD_ID);
      expect(neg.status).toBe('contato inicial');
      expect(neg.importance).toBe('frio');
      expect(neg.isOpen).toBe(true);
      expect(neg.motivoEncerramento).toBeNull();
      expect(neg.historico).toHaveLength(0);
    });

    it('throws INVALID_NEGOTIATION_STATUS for unknown status', () => {
      expect(() =>
        NegociacaoEntity.open({
          leadId: LEAD_ID,
          status: 'status inválido',
          importance: 'frio',
        }),
      ).toThrow(
        expect.objectContaining({ code: 'INVALID_NEGOTIATION_STATUS' }),
      );
    });

    it('throws INVALID_NEGOTIATION_IMPORTANCE for unknown importance', () => {
      expect(() =>
        NegociacaoEntity.open({
          leadId: LEAD_ID,
          status: 'contato inicial',
          importance: 'gelo',
        }),
      ).toThrow(
        expect.objectContaining({ code: 'INVALID_NEGOTIATION_IMPORTANCE' }),
      );
    });
  });

  describe('restore()', () => {
    it('restores a negotiation from persisted state', () => {
      const neg = NegociacaoEntity.restore(
        {
          leadId: LEAD_ID,
          status: 'em negociação',
          importance: 'quente',
          isOpen: true,
          motivoEncerramento: null,
          historico: [],
        },
        NEG_ID,
      );
      expect(neg.id).toBe(NEG_ID);
      expect(neg.status).toBe('em negociação');
    });
  });

  describe('recordChange()', () => {
    it('records a historico entry and updates status and importance', () => {
      const neg = NegociacaoEntity.open({
        leadId: LEAD_ID,
        status: 'contato inicial',
        importance: 'frio',
      });
      neg.recordChange({
        newStatus: 'em negociação',
        newImportance: 'morno',
        notes: 'Evoluindo bem',
        changedBy: USER_ID,
      });

      expect(neg.status).toBe('em negociação');
      expect(neg.importance).toBe('morno');
      expect(neg.historico).toHaveLength(1);

      const entry = neg.historico[0];
      expect(entry.previousStatus).toBe('contato inicial');
      expect(entry.previousImportance).toBe('frio');
      expect(entry.newStatus).toBe('em negociação');
      expect(entry.newImportance).toBe('morno');
      expect(entry.notes).toBe('Evoluindo bem');
      expect(entry.changedBy).toBe(USER_ID);
      expect(entry.changedAt).toBeInstanceOf(Date);
    });

    it('throws INVALID_NEGOTIATION_STATUS when new status is invalid', () => {
      const neg = NegociacaoEntity.open({
        leadId: LEAD_ID,
        status: 'contato inicial',
        importance: 'frio',
      });
      expect(() =>
        neg.recordChange({
          newStatus: 'inválido',
          newImportance: 'frio',
          notes: null,
          changedBy: USER_ID,
        }),
      ).toThrow(
        expect.objectContaining({ code: 'INVALID_NEGOTIATION_STATUS' }),
      );
    });

    it('throws INVALID_NEGOTIATION_IMPORTANCE when new importance is invalid', () => {
      const neg = NegociacaoEntity.open({
        leadId: LEAD_ID,
        status: 'contato inicial',
        importance: 'frio',
      });
      expect(() =>
        neg.recordChange({
          newStatus: 'em negociação',
          newImportance: 'gelado',
          notes: null,
          changedBy: USER_ID,
        }),
      ).toThrow(
        expect.objectContaining({ code: 'INVALID_NEGOTIATION_IMPORTANCE' }),
      );
    });

    it('throws NEGOTIATION_ALREADY_CLOSED when negotiation is closed', () => {
      const neg = NegociacaoEntity.open({
        leadId: LEAD_ID,
        status: 'contato inicial',
        importance: 'frio',
      });
      neg.close('Comprou outro carro.');
      expect(() =>
        neg.recordChange({
          newStatus: 'em negociação',
          newImportance: 'morno',
          notes: null,
          changedBy: USER_ID,
        }),
      ).toThrow(
        expect.objectContaining({ code: 'NEGOTIATION_ALREADY_CLOSED' }),
      );
    });

    it('accumulates multiple historico entries', () => {
      const neg = NegociacaoEntity.open({
        leadId: LEAD_ID,
        status: 'contato inicial',
        importance: 'frio',
      });
      neg.recordChange({
        newStatus: 'em negociação',
        newImportance: 'morno',
        notes: null,
        changedBy: USER_ID,
      });
      neg.recordChange({
        newStatus: 'proposta enviada',
        newImportance: 'quente',
        notes: 'Proposta enviada',
        changedBy: USER_ID,
      });

      expect(neg.historico).toHaveLength(2);
      expect(neg.status).toBe('proposta enviada');
    });
  });

  describe('close()', () => {
    it('closes the negotiation with a motivo', () => {
      const neg = NegociacaoEntity.open({
        leadId: LEAD_ID,
        status: 'proposta enviada',
        importance: 'quente',
      });
      neg.close('Cliente desistiu.');
      expect(neg.isOpen).toBe(false);
      expect(neg.motivoEncerramento).toBe('Cliente desistiu.');
    });

    it('throws INVALID_MOTIVO_ENCERRAMENTO when motivo is empty', () => {
      const neg = NegociacaoEntity.open({
        leadId: LEAD_ID,
        status: 'contato inicial',
        importance: 'frio',
      });
      expect(() => neg.close('')).toThrow(
        expect.objectContaining({ code: 'INVALID_MOTIVO_ENCERRAMENTO' }),
      );
    });

    it('throws INVALID_MOTIVO_ENCERRAMENTO when motivo is whitespace only', () => {
      const neg = NegociacaoEntity.open({
        leadId: LEAD_ID,
        status: 'contato inicial',
        importance: 'frio',
      });
      expect(() => neg.close('   ')).toThrow(
        expect.objectContaining({ code: 'INVALID_MOTIVO_ENCERRAMENTO' }),
      );
    });

    it('throws NEGOTIATION_ALREADY_CLOSED when closing again', () => {
      const neg = NegociacaoEntity.open({
        leadId: LEAD_ID,
        status: 'contato inicial',
        importance: 'frio',
      });
      neg.close('Primeiro motivo.');
      expect(() => neg.close('Segundo motivo.')).toThrow(
        expect.objectContaining({ code: 'NEGOTIATION_ALREADY_CLOSED' }),
      );
    });
  });
});
