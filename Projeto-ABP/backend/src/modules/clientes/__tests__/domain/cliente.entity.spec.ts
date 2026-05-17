import { ClienteEntity } from '../../domain/entities/cliente.entity';
import { DomainError } from '@/shared/errors/domain-error';

const validProps = {
  name: 'João Silva',
  phone: '5511987654321',
  email: 'joao@example.com',
};

describe('ClienteEntity', () => {
  it('creates a cliente with required fields', () => {
    const cliente = ClienteEntity.create(validProps);
    expect(cliente.id).toBeDefined();
    expect(cliente.name).toBe('João Silva');
    expect(cliente.phone).toBe('5511987654321');
    expect(cliente.email).toBe('joao@example.com');
    expect(cliente.cpf).toBeUndefined();
    expect(cliente.address).toBeUndefined();
  });

  it('creates a cliente with all fields', () => {
    const cliente = ClienteEntity.create({
      ...validProps,
      cpf: '52998224725',
      address: 'Rua das Flores, 123',
    });
    expect(cliente.cpf).toBe('52998224725');
    expect(cliente.address).toBe('Rua das Flores, 123');
  });

  it('restores a cliente from stored data', () => {
    const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const cliente = ClienteEntity.restore({ ...validProps }, id);
    expect(cliente.id).toBe(id);
  });

  it('throws for invalid email', () => {
    expect(() =>
      ClienteEntity.create({ ...validProps, email: 'not-an-email' }),
    ).toThrow(DomainError);
  });

  it('throws for invalid phone', () => {
    expect(() =>
      ClienteEntity.create({ ...validProps, phone: '11987654321' }),
    ).toThrow(DomainError);
  });

  it('throws for invalid CPF when provided', () => {
    expect(() => ClienteEntity.create({ ...validProps, cpf: '123' })).toThrow(
      DomainError,
    );
  });

  it('updates name and email', () => {
    const cliente = ClienteEntity.create(validProps);
    cliente.update({ name: 'Maria Souza', email: 'maria@example.com' });
    expect(cliente.name).toBe('Maria Souza');
    expect(cliente.email).toBe('maria@example.com');
    expect(cliente.phone).toBe('5511987654321');
  });

  it('update with invalid email throws', () => {
    const cliente = ClienteEntity.create(validProps);
    expect(() => cliente.update({ email: 'bad' })).toThrow(DomainError);
  });

  it('update with invalid phone throws', () => {
    const cliente = ClienteEntity.create(validProps);
    expect(() => cliente.update({ phone: '123' })).toThrow(DomainError);
  });
});
