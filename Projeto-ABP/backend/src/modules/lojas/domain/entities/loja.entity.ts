import { Entity } from '@/shared/core/entity';
import { DomainError } from '@/shared/errors/domain-error';
import { Phone } from '@/shared/domain/value-objects/phone.vo';

interface LojaProps {
  name: string;
  city: string;
  address?: string;
  phone?: Phone;
}

interface LojaInput {
  name: string;
  city: string;
  address?: string;
  phone?: string;
}

export class LojaEntity extends Entity<LojaProps> {
  static create(input: LojaInput): LojaEntity {
    if (!input.name?.trim()) {
      throw new DomainError('Nome da loja é obrigatório.', 'INVALID_LOJA_NAME');
    }
    if (!input.city?.trim()) {
      throw new DomainError(
        'Cidade da loja é obrigatória.',
        'INVALID_LOJA_CITY',
      );
    }
    return new LojaEntity({
      name: input.name,
      city: input.city,
      address: input.address,
      phone: input.phone !== undefined ? Phone.create(input.phone) : undefined,
    });
  }

  static restore(input: LojaInput, id: string): LojaEntity {
    return new LojaEntity(
      {
        name: input.name,
        city: input.city,
        address: input.address,
        phone:
          input.phone !== undefined ? Phone.create(input.phone) : undefined,
      },
      id,
    );
  }

  get name(): string {
    return this.props.name;
  }

  get city(): string {
    return this.props.city;
  }

  get address(): string | undefined {
    return this.props.address;
  }

  get phone(): string | undefined {
    return this.props.phone?.value;
  }

  update(fields: Partial<LojaInput>): void {
    if (fields.name !== undefined && !fields.name.trim()) {
      throw new DomainError('Nome da loja é obrigatório.', 'INVALID_LOJA_NAME');
    }
    if (fields.city !== undefined && !fields.city.trim()) {
      throw new DomainError(
        'Cidade da loja é obrigatória.',
        'INVALID_LOJA_CITY',
      );
    }
    this.props = {
      ...this.props,
      ...(fields.name !== undefined ? { name: fields.name } : {}),
      ...(fields.city !== undefined ? { city: fields.city } : {}),
      ...(fields.address !== undefined ? { address: fields.address } : {}),
      ...(fields.phone !== undefined
        ? { phone: Phone.create(fields.phone) }
        : {}),
    };
  }
}
