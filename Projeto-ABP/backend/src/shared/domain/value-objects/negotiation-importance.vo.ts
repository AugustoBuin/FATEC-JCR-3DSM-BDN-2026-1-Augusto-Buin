import { ValueObject } from '@/shared/core/value-object';
import { DomainError } from '@/shared/errors/domain-error';

export const NEGOTIATION_IMPORTANCES = ['frio', 'morno', 'quente'] as const;

export type NegotiationImportanceValue =
  (typeof NEGOTIATION_IMPORTANCES)[number];

interface NegotiationImportanceProps {
  value: NegotiationImportanceValue;
}

export class NegotiationImportance extends ValueObject<NegotiationImportanceProps> {
  static create(raw: string): NegotiationImportance {
    if (!NEGOTIATION_IMPORTANCES.includes(raw as NegotiationImportanceValue)) {
      throw new DomainError(
        `Importância inválida. Use um dos valores: ${NEGOTIATION_IMPORTANCES.join(', ')}.`,
        'INVALID_NEGOTIATION_IMPORTANCE',
      );
    }
    return new NegotiationImportance({
      value: raw as NegotiationImportanceValue,
    });
  }

  get value(): NegotiationImportanceValue {
    return this.props.value;
  }
}
