import { Entity } from '@/shared/core/entity';

interface LojaProps {
  name: string;
  city: string;
  address?: string;
  phone?: string;
}

export class LojaEntity extends Entity<LojaProps> {
  static create(props: LojaProps): LojaEntity {
    return new LojaEntity(props);
  }

  static restore(props: LojaProps, id: string): LojaEntity {
    return new LojaEntity(props, id);
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
    return this.props.phone;
  }

  update(fields: Partial<LojaProps>): void {
    this.props = { ...this.props, ...fields };
  }
}
