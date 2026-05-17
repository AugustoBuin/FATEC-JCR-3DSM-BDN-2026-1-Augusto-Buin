import { ValueObject } from '@/shared/core/value-object';
import { DomainError } from '@/shared/errors/domain-error';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new DomainError('E-mail inválido.', 'INVALID_EMAIL');
    }
    return new Email({ value: normalized });
  }
}
