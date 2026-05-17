import { LeadEntity } from '../../domain/entities/lead.entity';

const VALID_ID = '10000000-0000-4000-8000-000000000001';
const VALID_TEAM_ID = '20000000-0000-4000-8000-000000000002';
const VALID_LOJA_ID = '30000000-0000-4000-8000-000000000003';
const VALID_CLIENT_ID = '40000000-0000-4000-8000-000000000004';
const VALID_USER_ID = '50000000-0000-4000-8000-000000000005';

const baseProps = {
  teamId: VALID_TEAM_ID,
  lojaId: VALID_LOJA_ID,
  clientId: VALID_CLIENT_ID,
  userId: VALID_USER_ID,
  source: 'WhatsApp',
  subject: 'Interesse em Honda Civic',
};

describe('LeadEntity', () => {
  describe('create()', () => {
    it('creates a lead with null currentStatus and currentImportance', () => {
      const lead = LeadEntity.create(baseProps);
      expect(lead.id).toBeDefined();
      expect(lead.source).toBe('WhatsApp');
      expect(lead.subject).toBe('Interesse em Honda Civic');
      expect(lead.currentStatus).toBeNull();
      expect(lead.currentImportance).toBeNull();
    });

    it('throws INVALID_LEAD_SUBJECT when subject is empty', () => {
      expect(() => LeadEntity.create({ ...baseProps, subject: '' })).toThrow(
        expect.objectContaining({ code: 'INVALID_LEAD_SUBJECT' }),
      );
    });

    it('throws INVALID_LEAD_SUBJECT when subject is only whitespace', () => {
      expect(() => LeadEntity.create({ ...baseProps, subject: '   ' })).toThrow(
        expect.objectContaining({ code: 'INVALID_LEAD_SUBJECT' }),
      );
    });

    it('throws INVALID_LEAD_SOURCE for unknown source', () => {
      expect(() =>
        LeadEntity.create({ ...baseProps, source: 'TikTok' }),
      ).toThrow(expect.objectContaining({ code: 'INVALID_LEAD_SOURCE' }));
    });

    it('trims subject whitespace on creation', () => {
      const lead = LeadEntity.create({
        ...baseProps,
        subject: '  Carro novo  ',
      });
      expect(lead.subject).toBe('Carro novo');
    });
  });

  describe('restore()', () => {
    it('restores a lead with existing state', () => {
      const lead = LeadEntity.restore(
        {
          ...baseProps,
          currentStatus: 'em negociação',
          currentImportance: 'quente',
        },
        VALID_ID,
      );
      expect(lead.id).toBe(VALID_ID);
      expect(lead.currentStatus).toBe('em negociação');
      expect(lead.currentImportance).toBe('quente');
    });
  });

  describe('update()', () => {
    it('updates subject', () => {
      const lead = LeadEntity.create(baseProps);
      lead.update({ subject: 'Novo assunto' });
      expect(lead.subject).toBe('Novo assunto');
    });

    it('updates source to a valid value', () => {
      const lead = LeadEntity.create(baseProps);
      lead.update({ source: 'Instagram' });
      expect(lead.source).toBe('Instagram');
    });

    it('throws INVALID_LEAD_SUBJECT when updating to empty string', () => {
      const lead = LeadEntity.create(baseProps);
      expect(() => lead.update({ subject: '' })).toThrow(
        expect.objectContaining({ code: 'INVALID_LEAD_SUBJECT' }),
      );
    });

    it('throws INVALID_LEAD_SOURCE when updating to unknown source', () => {
      const lead = LeadEntity.create(baseProps);
      expect(() => lead.update({ source: 'Twitter' })).toThrow(
        expect.objectContaining({ code: 'INVALID_LEAD_SOURCE' }),
      );
    });

    it('does not change unspecified fields', () => {
      const lead = LeadEntity.create(baseProps);
      lead.update({ subject: 'Outro assunto' });
      expect(lead.source).toBe('WhatsApp');
      expect(lead.userId).toBe(VALID_USER_ID);
    });
  });
});
