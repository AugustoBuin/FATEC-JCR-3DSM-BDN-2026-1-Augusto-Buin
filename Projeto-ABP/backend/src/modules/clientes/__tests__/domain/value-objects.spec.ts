import { Email } from '../../domain/value-objects/email.vo';
import { Phone } from '../../domain/value-objects/phone.vo';
import { Cpf } from '../../domain/value-objects/cpf.vo';
import { DomainError } from '@/shared/errors/domain-error';

describe('Email', () => {
  it('accepts a valid email', () => {
    const email = Email.create('test@example.com');
    expect(email.value).toBe('test@example.com');
  });

  it('normalizes to lowercase', () => {
    const email = Email.create('Test@Example.COM');
    expect(email.value).toBe('test@example.com');
  });

  it('throws for missing @', () => {
    expect(() => Email.create('notanemail')).toThrow(DomainError);
  });

  it('throws for missing domain', () => {
    expect(() => Email.create('user@')).toThrow(DomainError);
  });

  it('throws for empty string', () => {
    expect(() => Email.create('')).toThrow(DomainError);
  });

  it('equals returns true for same value', () => {
    const a = Email.create('a@b.com');
    const b = Email.create('a@b.com');
    expect(a.equals(b)).toBe(true);
  });

  it('equals returns false for different value', () => {
    const a = Email.create('a@b.com');
    const b = Email.create('c@d.com');
    expect(a.equals(b)).toBe(false);
  });
});

describe('Phone', () => {
  it('accepts a valid phone: 55 + 2 DDD digits + 9 digits', () => {
    const phone = Phone.create('5511987654321');
    expect(phone.value).toBe('5511987654321');
  });

  it('throws for wrong length (12 digits)', () => {
    expect(() => Phone.create('551198765432')).toThrow(DomainError);
  });

  it('throws for wrong length (14 digits)', () => {
    expect(() => Phone.create('55119876543210')).toThrow(DomainError);
  });

  it('throws for non-digit characters', () => {
    expect(() => Phone.create('5511-98765-4321')).toThrow(DomainError);
  });

  it('throws for empty string', () => {
    expect(() => Phone.create('')).toThrow(DomainError);
  });

  it('throws when not starting with 55', () => {
    expect(() => Phone.create('1111987654321')).toThrow(DomainError);
  });

  it('equals returns true for same value', () => {
    const a = Phone.create('5511987654321');
    const b = Phone.create('5511987654321');
    expect(a.equals(b)).toBe(true);
  });
});

describe('Cpf', () => {
  it('accepts exactly 11 digits', () => {
    const cpf = Cpf.create('12345678901');
    expect(cpf.value).toBe('12345678901');
  });

  it('throws for 10 digits', () => {
    expect(() => Cpf.create('1234567890')).toThrow(DomainError);
  });

  it('throws for 12 digits', () => {
    expect(() => Cpf.create('123456789012')).toThrow(DomainError);
  });

  it('throws for non-digit characters', () => {
    expect(() => Cpf.create('123.456.789-01')).toThrow(DomainError);
  });

  it('throws for empty string', () => {
    expect(() => Cpf.create('')).toThrow(DomainError);
  });

  it('equals returns true for same value', () => {
    const a = Cpf.create('12345678901');
    const b = Cpf.create('12345678901');
    expect(a.equals(b)).toBe(true);
  });
});
