import { ValueObject } from '@/shared/core/value-object';
import { DomainError } from '@/shared/errors/domain-error';

export const LEAD_SOURCES = [
  'Visita presencial',
  'Telefone',
  'WhatsApp',
  'Instagram',
  'Facebook',
  'Mercado Livre',
  'Webmotors',
  'Formulário digital',
] as const;

export type LeadSourceValue = (typeof LEAD_SOURCES)[number];

interface LeadSourceProps {
  value: LeadSourceValue;
}

export class LeadSource extends ValueObject<LeadSourceProps> {
  static create(raw: string): LeadSource {
    if (!LEAD_SOURCES.includes(raw as LeadSourceValue)) {
      throw new DomainError(
        `Origem inválida. Use um dos valores: ${LEAD_SOURCES.join(', ')}.`,
        'INVALID_LEAD_SOURCE',
      );
    }
    return new LeadSource({ value: raw as LeadSourceValue });
  }

  get value(): LeadSourceValue {
    return this.props.value;
  }
}
