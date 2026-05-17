import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { DomainError } from '@/shared/errors/domain-error';

const validInput = {
  name: 'Maria Admin',
  email: 'maria@example.com',
  role: 'admin',
  passwordHash: '$2b$10$hashed',
  teamId: null,
};

const VALID_ID = '123e4567-e89b-4d3c-a456-426614174000';

describe('UsuarioEntity', () => {
  it('creates a usuario and generates a UUID id', () => {
    const u = UsuarioEntity.create(validInput);
    expect(u.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(u.name).toBe('Maria Admin');
    expect(u.email).toBe('maria@example.com');
    expect(u.role).toBe('admin');
    expect(u.passwordHash).toBe('$2b$10$hashed');
    expect(u.teamId).toBeNull();
  });

  it('restores a usuario with the given id', () => {
    const u = UsuarioEntity.restore(validInput, VALID_ID);
    expect(u.id).toBe(VALID_ID);
  });

  it('throws INVALID_ENTITY_ID when restoring with an invalid id', () => {
    expect(() => UsuarioEntity.restore(validInput, 'not-a-uuid')).toThrow(
      DomainError,
    );
  });

  it('throws INVALID_USUARIO_NAME when name is empty', () => {
    expect(() => UsuarioEntity.create({ ...validInput, name: '' })).toThrow(
      DomainError,
    );
  });

  it('throws INVALID_EMAIL for invalid email', () => {
    expect(() => UsuarioEntity.create({ ...validInput, email: 'bad' })).toThrow(
      DomainError,
    );
  });

  it('throws INVALID_ROLE for unknown role', () => {
    expect(() =>
      UsuarioEntity.create({ ...validInput, role: 'superadmin' }),
    ).toThrow(DomainError);
  });

  it('stores teamId as provided', () => {
    const id = '223e4567-e89b-4d3c-a456-426614174001';
    const u = UsuarioEntity.create({ ...validInput, teamId: id });
    expect(u.teamId).toBe(id);
  });

  it('update() changes name', () => {
    const u = UsuarioEntity.create(validInput);
    u.update({ name: 'Novo Nome' });
    expect(u.name).toBe('Novo Nome');
  });

  it('update() changes role', () => {
    const u = UsuarioEntity.create(validInput);
    u.update({ role: 'atendente' });
    expect(u.role).toBe('atendente');
  });

  it('update() changes passwordHash', () => {
    const u = UsuarioEntity.create(validInput);
    u.update({ passwordHash: 'new-hash' });
    expect(u.passwordHash).toBe('new-hash');
  });

  it('update() throws INVALID_USUARIO_NAME when setting empty name', () => {
    const u = UsuarioEntity.create(validInput);
    expect(() => u.update({ name: '' })).toThrow(DomainError);
  });

  it('two usuarios with the same id are equal', () => {
    const a = UsuarioEntity.restore(validInput, VALID_ID);
    const b = UsuarioEntity.restore({ ...validInput, name: 'Other' }, VALID_ID);
    expect(a.equals(b)).toBe(true);
  });
});
