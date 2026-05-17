import { TimeEntity } from '../../domain/entities/time.entity';
import { DomainError } from '@/shared/errors/domain-error';

const VALID_LOJA_ID = '123e4567-e89b-4d3c-a456-426614174000';

describe('TimeEntity', () => {
  it('creates a time with valid props and generates a UUID id', () => {
    const time = TimeEntity.create({
      name: 'Time Alpha',
      lojaId: VALID_LOJA_ID,
    });
    expect(time.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(time.name).toBe('Time Alpha');
    expect(time.lojaId).toBe(VALID_LOJA_ID);
  });

  it('restores a time from persistence with a given id', () => {
    const id = '223e4567-e89b-4d3c-a456-426614174001';
    const time = TimeEntity.restore(
      { name: 'Time Beta', lojaId: VALID_LOJA_ID },
      id,
    );
    expect(time.id).toBe(id);
  });

  it('throws DomainError when restoring with an invalid id', () => {
    expect(() =>
      TimeEntity.restore({ name: 'X', lojaId: VALID_LOJA_ID }, 'not-a-uuid'),
    ).toThrow(DomainError);
  });

  it('update() changes the name', () => {
    const time = TimeEntity.create({
      name: 'Time Alpha',
      lojaId: VALID_LOJA_ID,
    });
    time.update({ name: 'Time Omega' });
    expect(time.name).toBe('Time Omega');
    expect(time.lojaId).toBe(VALID_LOJA_ID);
  });

  it('two times with the same id are equal', () => {
    const id = '223e4567-e89b-4d3c-a456-426614174001';
    const a = TimeEntity.restore({ name: 'A', lojaId: VALID_LOJA_ID }, id);
    const b = TimeEntity.restore({ name: 'B', lojaId: VALID_LOJA_ID }, id);
    expect(a.equals(b)).toBe(true);
  });

  it('two times with different ids are not equal', () => {
    const a = TimeEntity.create({ name: 'A', lojaId: VALID_LOJA_ID });
    const b = TimeEntity.create({ name: 'A', lojaId: VALID_LOJA_ID });
    expect(a.equals(b)).toBe(false);
  });

  it('throws INVALID_LOJA_ID when lojaId is not a UUID v4', () => {
    expect(() =>
      TimeEntity.create({ name: 'Time', lojaId: 'not-a-uuid' }),
    ).toThrow(DomainError);
  });
});
