import { randomUUID } from 'node:crypto';
import { DomainError } from '../errors/domain-error';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export abstract class Entity<T extends object> {
  protected readonly _id: string;
  /** Mutable by design — mutate only via domain methods that enforce invariants. */
  protected props: T;

  constructor(props: T, id?: string) {
    if (id !== undefined && !UUID_V4_REGEX.test(id)) {
      throw new DomainError(
        'O identificador da entidade deve ser um UUID v4 válido.',
        'INVALID_ENTITY_ID',
      );
    }
    this._id = id ?? randomUUID();
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  equals(other: Entity<T>): boolean {
    if (!(other instanceof Entity)) return false;
    return this._id === other._id;
  }

  toString(): string {
    return `${this.constructor.name}(${this._id})`;
  }
}
