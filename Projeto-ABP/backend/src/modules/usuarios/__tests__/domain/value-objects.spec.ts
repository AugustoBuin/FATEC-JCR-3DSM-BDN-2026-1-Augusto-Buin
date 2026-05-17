import { Email } from '../../domain/value-objects/email.vo';
import { Role } from '../../domain/value-objects/role.vo';
import { DomainError } from '@/shared/errors/domain-error';

describe('Email (usuarios)', () => {
  it('accepts a valid email', () => {
    expect(Email.create('test@example.com').value).toBe('test@example.com');
  });

  it('normalizes to lowercase', () => {
    expect(Email.create('Test@EXAMPLE.COM').value).toBe('test@example.com');
  });

  it('throws INVALID_EMAIL for missing @', () => {
    expect(() => Email.create('notanemail')).toThrow(DomainError);
  });

  it('throws INVALID_EMAIL for empty string', () => {
    expect(() => Email.create('')).toThrow(DomainError);
  });

  it('equals returns true for same email', () => {
    expect(Email.create('a@b.com').equals(Email.create('a@b.com'))).toBe(true);
  });
});

describe('Role', () => {
  it.each(['admin', 'gerente geral', 'gerente de equipe', 'atendente'])(
    'accepts valid role "%s"',
    (role) => {
      expect(Role.create(role).value).toBe(role);
    },
  );

  it('throws INVALID_ROLE for unknown value', () => {
    expect(() => Role.create('superadmin')).toThrow(DomainError);
  });

  it('throws INVALID_ROLE for empty string', () => {
    expect(() => Role.create('')).toThrow(DomainError);
  });

  it('equals returns true for same role', () => {
    expect(Role.create('admin').equals(Role.create('admin'))).toBe(true);
  });

  it('equals returns false for different roles', () => {
    expect(Role.create('admin').equals(Role.create('atendente'))).toBe(false);
  });
});
