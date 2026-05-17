import { ValueObject } from '@/shared/core/value-object';
import { DomainError } from '@/shared/errors/domain-error';

export const NEGOTIATION_STATUSES = [
  'contato inicial',
  'em negociação',
  'proposta enviada',
  'test drive',
  'fechado - vendido',
  'fechado - não vendido',
] as const;

export type NegotiationStatusValue = (typeof NEGOTIATION_STATUSES)[number];

interface NegotiationStatusProps {
  value: NegotiationStatusValue;
}

export class NegotiationStatus extends ValueObject<NegotiationStatusProps> {
  static create(raw: string): NegotiationStatus {
    if (!NEGOTIATION_STATUSES.includes(raw as NegotiationStatusValue)) {
      throw new DomainError(
        `Status inválido. Use um dos valores: ${NEGOTIATION_STATUSES.join(', ')}.`,
        'INVALID_NEGOTIATION_STATUS',
      );
    }
    return new NegotiationStatus({ value: raw as NegotiationStatusValue });
  }

  get value(): NegotiationStatusValue {
    return this.props.value;
  }
}
