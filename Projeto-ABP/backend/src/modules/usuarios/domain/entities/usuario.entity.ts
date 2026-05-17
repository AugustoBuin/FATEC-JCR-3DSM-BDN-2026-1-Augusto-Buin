import { Entity } from '@/shared/core/entity';
import { DomainError } from '@/shared/errors/domain-error';
import { Email } from '../value-objects/email.vo';
import { Role } from '../value-objects/role.vo';

interface UsuarioProps {
  name: string;
  email: Email;
  role: Role;
  passwordHash: string;
  teamId: string | null;
}

interface UsuarioCreateInput {
  name: string;
  email: string;
  role: string;
  passwordHash: string;
  teamId?: string | null;
}

interface UsuarioUpdateInput {
  name?: string;
  email?: string;
  role?: string;
  passwordHash?: string;
  teamId?: string | null;
}

export class UsuarioEntity extends Entity<UsuarioProps> {
  private constructor(props: UsuarioProps, id?: string) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }
  get email(): string {
    return this.props.email.value;
  }
  get role(): string {
    return this.props.role.value;
  }
  get passwordHash(): string {
    return this.props.passwordHash;
  }
  get teamId(): string | null {
    return this.props.teamId;
  }

  static create(input: UsuarioCreateInput, id?: string): UsuarioEntity {
    if (!input.name?.trim()) {
      throw new DomainError('Nome é obrigatório.', 'INVALID_USUARIO_NAME');
    }
    return new UsuarioEntity(
      {
        name: input.name.trim(),
        email: Email.create(input.email),
        role: Role.create(input.role),
        passwordHash: input.passwordHash,
        teamId: input.teamId ?? null,
      },
      id,
    );
  }

  static restore(input: UsuarioCreateInput, id: string): UsuarioEntity {
    return UsuarioEntity.create(input, id);
  }

  update(input: UsuarioUpdateInput): void {
    if (input.name !== undefined) {
      if (!input.name.trim())
        throw new DomainError('Nome é obrigatório.', 'INVALID_USUARIO_NAME');
      this.props.name = input.name.trim();
    }
    if (input.email !== undefined) this.props.email = Email.create(input.email);
    if (input.role !== undefined) this.props.role = Role.create(input.role);
    if (input.passwordHash !== undefined)
      this.props.passwordHash = input.passwordHash;
    if (input.teamId !== undefined) this.props.teamId = input.teamId;
  }
}
