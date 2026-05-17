import { ValueObject } from '@/shared/core/value-object';
import { DomainError } from '@/shared/errors/domain-error';

export const VALID_ROLES = [
  'admin',
  'gerente geral',
  'gerente de equipe',
  'atendente',
] as const;
export type RoleValue = (typeof VALID_ROLES)[number];

interface RoleProps {
  value: RoleValue;
}

export class Role extends ValueObject<RoleProps> {
  private constructor(props: RoleProps) {
    super(props);
  }

  get value(): RoleValue {
    return this.props.value;
  }

  static create(raw: string): Role {
    if (!VALID_ROLES.includes(raw as RoleValue)) {
      throw new DomainError(
        `Role inválida. Valores aceitos: ${VALID_ROLES.join(', ')}.`,
        'INVALID_ROLE',
      );
    }
    return new Role({ value: raw as RoleValue });
  }
}
