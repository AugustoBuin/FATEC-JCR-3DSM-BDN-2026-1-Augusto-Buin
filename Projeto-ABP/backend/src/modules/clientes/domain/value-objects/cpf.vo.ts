import { ValueObject } from '@/shared/core/value-object';
import { DomainError } from '@/shared/errors/domain-error';

interface CpfProps {
  value: string;
}

export class Cpf extends ValueObject<CpfProps> {
  private constructor(props: CpfProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(raw: string): Cpf {
    if (!/^\d{11}$/.test(raw)) {
      throw new DomainError(
        'CPF inválido. Deve conter exatamente 11 dígitos.',
        'INVALID_CPF',
      );
    }
    return new Cpf({ value: raw });
  }
}
