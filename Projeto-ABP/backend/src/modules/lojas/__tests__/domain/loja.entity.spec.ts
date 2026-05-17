import { LojaEntity } from '../../domain/entities/loja.entity';
import { DomainError } from '@/shared/errors/domain-error';

const validProps = {
  name: 'Loja Centro',
  city: 'São José dos Campos',
  address: 'Rua das Flores, 123',
  phone: '1234-5678',
};

describe('LojaEntity', () => {
  it('creates a loja with valid props and generates a UUID id', () => {
    const loja = LojaEntity.create(validProps);
    expect(loja.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(loja.name).toBe('Loja Centro');
    expect(loja.city).toBe('São José dos Campos');
  });

  it('restores a loja from persistence with a given id', () => {
    const id = '123e4567-e89b-4d3c-a456-426614174000';
    const loja = LojaEntity.restore(validProps, id);
    expect(loja.id).toBe(id);
  });

  it('throws DomainError when restoring with an invalid id', () => {
    expect(() => LojaEntity.restore(validProps, 'not-a-uuid')).toThrow(
      DomainError,
    );
  });

  it('address and phone are optional', () => {
    const loja = LojaEntity.create({ name: 'Loja Sul', city: 'Jacareí' });
    expect(loja.address).toBeUndefined();
    expect(loja.phone).toBeUndefined();
  });

  it('update() changes allowed fields', () => {
    const loja = LojaEntity.create(validProps);
    loja.update({ name: 'Loja Norte', city: 'Taubaté' });
    expect(loja.name).toBe('Loja Norte');
    expect(loja.city).toBe('Taubaté');
    expect(loja.address).toBe('Rua das Flores, 123');
  });

  it('two lojas with the same id are equal', () => {
    const id = '123e4567-e89b-4d3c-a456-426614174000';
    const a = LojaEntity.restore(validProps, id);
    const b = LojaEntity.restore({ name: 'Outra', city: 'Outra' }, id);
    expect(a.equals(b)).toBe(true);
  });

  it('two lojas with different ids are not equal', () => {
    const a = LojaEntity.create(validProps);
    const b = LojaEntity.create(validProps);
    expect(a.equals(b)).toBe(false);
  });
});
