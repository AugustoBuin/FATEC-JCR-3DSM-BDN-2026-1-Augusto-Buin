import { ValueObject } from '@/shared/core/value-object';
import { DomainError } from '@/shared/errors/domain-error';

interface PhoneProps {
  value: string;
}

export class Phone extends ValueObject<PhoneProps> {
  private constructor(props: PhoneProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(raw: string): Phone {
    // Must be exactly 13 digits: 55 + 2 DDD + 9 number digits
    if (!/^\d{13}$/.test(raw) || !raw.startsWith('55')) {
      throw new DomainError(
        'Telefone inválido. Use o formato: 55 + DDD + 9 dígitos.',
        'INVALID_PHONE',
      );
    }
    return new Phone({ value: raw });
  }
}
