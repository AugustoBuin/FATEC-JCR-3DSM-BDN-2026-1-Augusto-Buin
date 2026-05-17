import { NegotiationStatus } from '../../domain/value-objects/negotiation-status.vo';
import { NegotiationImportance } from '../../domain/value-objects/negotiation-importance.vo';
import { Phone } from '../../domain/value-objects/phone.vo';
import { Email } from '../../domain/value-objects/email.vo';

describe('NegotiationStatus', () => {
  it('creates with a valid status', () => {
    const vo = NegotiationStatus.create('contato inicial');
    expect(vo.value).toBe('contato inicial');
  });

  it('throws INVALID_NEGOTIATION_STATUS for unknown value', () => {
    expect(() => NegotiationStatus.create('unknown')).toThrow(
      expect.objectContaining({ code: 'INVALID_NEGOTIATION_STATUS' }),
    );
  });

  it('accepts all defined statuses', () => {
    const statuses = [
      'contato inicial',
      'em negociação',
      'proposta enviada',
      'test drive',
      'fechado - vendido',
      'fechado - não vendido',
    ];
    for (const s of statuses) {
      expect(() => NegotiationStatus.create(s)).not.toThrow();
    }
  });
});

describe('NegotiationImportance', () => {
  it('creates with a valid importance', () => {
    const vo = NegotiationImportance.create('frio');
    expect(vo.value).toBe('frio');
  });

  it('throws INVALID_NEGOTIATION_IMPORTANCE for unknown value', () => {
    expect(() => NegotiationImportance.create('gelado')).toThrow(
      expect.objectContaining({ code: 'INVALID_NEGOTIATION_IMPORTANCE' }),
    );
  });

  it('accepts all defined importances', () => {
    for (const v of ['frio', 'morno', 'quente']) {
      expect(() => NegotiationImportance.create(v)).not.toThrow();
    }
  });
});

describe('Phone', () => {
  it('creates with a valid phone number', () => {
    const vo = Phone.create('5512987654321');
    expect(vo.value).toBe('5512987654321');
  });

  it('throws INVALID_PHONE when not starting with 55', () => {
    expect(() => Phone.create('1112987654321')).toThrow(
      expect.objectContaining({ code: 'INVALID_PHONE' }),
    );
  });

  it('throws INVALID_PHONE when length is wrong', () => {
    expect(() => Phone.create('551298765432')).toThrow(
      expect.objectContaining({ code: 'INVALID_PHONE' }),
    );
  });

  it('throws INVALID_PHONE when not digits only', () => {
    expect(() => Phone.create('5512-98765-4321')).toThrow(
      expect.objectContaining({ code: 'INVALID_PHONE' }),
    );
  });
});

describe('Email (shared)', () => {
  it('creates and normalizes to lowercase', () => {
    const vo = Email.create('User@Example.COM');
    expect(vo.value).toBe('user@example.com');
  });

  it('throws INVALID_EMAIL for invalid format', () => {
    expect(() => Email.create('not-an-email')).toThrow(
      expect.objectContaining({ code: 'INVALID_EMAIL' }),
    );
  });
});
