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
    if (!Cpf.isValidChecksum(raw)) {
      throw new DomainError('CPF inválido.', 'INVALID_CPF');
    }
    return new Cpf({ value: raw });
  }

  private static isValidChecksum(cpf: string): boolean {
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    const digits = cpf.split('').map(Number);
    const sum1 = digits
      .slice(0, 9)
      .reduce((acc, d, i) => acc + d * (10 - i), 0);
    const rem1 = sum1 % 11;
    const d1 = rem1 < 2 ? 0 : 11 - rem1;
    if (d1 !== digits[9]) return false;
    const sum2 = digits
      .slice(0, 10)
      .reduce((acc, d, i) => acc + d * (11 - i), 0);
    const rem2 = sum2 % 11;
    const d2 = rem2 < 2 ? 0 : 11 - rem2;
    return d2 === digits[10];
  }
}
