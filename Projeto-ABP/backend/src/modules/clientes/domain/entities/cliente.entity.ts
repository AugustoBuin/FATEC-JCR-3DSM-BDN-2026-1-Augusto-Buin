import { Entity } from '@/shared/core/entity';
import { Email } from '../value-objects/email.vo';
import { Phone } from '../value-objects/phone.vo';
import { Cpf } from '../value-objects/cpf.vo';

interface ClienteProps {
  name: string;
  phone: Phone;
  email: Email;
  cpf?: Cpf;
  address?: string;
}

interface ClienteCreateInput {
  name: string;
  phone: string;
  email: string;
  cpf?: string;
  address?: string;
}

interface ClienteUpdateInput {
  name?: string;
  phone?: string;
  email?: string;
  cpf?: string;
  address?: string;
}

export class ClienteEntity extends Entity<ClienteProps> {
  private constructor(props: ClienteProps, id?: string) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get phone(): string {
    return this.props.phone.value;
  }

  get email(): string {
    return this.props.email.value;
  }

  get cpf(): string | undefined {
    return this.props.cpf?.value;
  }

  get address(): string | undefined {
    return this.props.address;
  }

  static create(input: ClienteCreateInput, id?: string): ClienteEntity {
    return new ClienteEntity(
      {
        name: input.name,
        phone: Phone.create(input.phone),
        email: Email.create(input.email),
        cpf: input.cpf !== undefined ? Cpf.create(input.cpf) : undefined,
        address: input.address,
      },
      id,
    );
  }

  static restore(
    input: ClienteCreateInput & { phone: string; email: string; cpf?: string },
    id: string,
  ): ClienteEntity {
    return ClienteEntity.create(input, id);
  }

  update(input: ClienteUpdateInput): void {
    if (input.name !== undefined) this.props.name = input.name;
    if (input.phone !== undefined) this.props.phone = Phone.create(input.phone);
    if (input.email !== undefined) this.props.email = Email.create(input.email);
    if (input.cpf !== undefined) this.props.cpf = Cpf.create(input.cpf);
    if (input.address !== undefined) this.props.address = input.address;
  }
}
