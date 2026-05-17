import { Entity } from '@/shared/core/entity';
import { DomainError } from '@/shared/errors/domain-error';
import { LeadSource } from '../value-objects/lead-source.vo';
import { NegotiationStatus } from '@/shared/domain/value-objects/negotiation-status.vo';
import { NegotiationImportance } from '@/shared/domain/value-objects/negotiation-importance.vo';

interface LeadProps {
  teamId: string;
  lojaId: string;
  clientId: string;
  userId: string;
  source: LeadSource;
  subject: string;
  currentStatus: NegotiationStatus | null;
  currentImportance: NegotiationImportance | null;
}

export class LeadEntity extends Entity<LeadProps> {
  static create(props: {
    teamId: string;
    lojaId: string;
    clientId: string;
    userId: string;
    source: string;
    subject: string;
  }): LeadEntity {
    if (!props.subject?.trim()) {
      throw new DomainError('Assunto é obrigatório.', 'INVALID_LEAD_SUBJECT');
    }
    return new LeadEntity({
      teamId: props.teamId,
      lojaId: props.lojaId,
      clientId: props.clientId,
      userId: props.userId,
      source: LeadSource.create(props.source),
      subject: props.subject.trim(),
      currentStatus: null,
      currentImportance: null,
    });
  }

  static restore(
    props: {
      teamId: string;
      lojaId: string;
      clientId: string;
      userId: string;
      source: string;
      subject: string;
      currentStatus: string | null;
      currentImportance: string | null;
    },
    id: string,
  ): LeadEntity {
    return new LeadEntity(
      {
        teamId: props.teamId,
        lojaId: props.lojaId,
        clientId: props.clientId,
        userId: props.userId,
        source: LeadSource.create(props.source),
        subject: props.subject,
        currentStatus:
          props.currentStatus !== null
            ? NegotiationStatus.create(props.currentStatus)
            : null,
        currentImportance:
          props.currentImportance !== null
            ? NegotiationImportance.create(props.currentImportance)
            : null,
      },
      id,
    );
  }

  get teamId(): string {
    return this.props.teamId;
  }
  get lojaId(): string {
    return this.props.lojaId;
  }
  get clientId(): string {
    return this.props.clientId;
  }
  get userId(): string {
    return this.props.userId;
  }
  get source(): string {
    return this.props.source.value;
  }
  get subject(): string {
    return this.props.subject;
  }
  get currentStatus(): string | null {
    return this.props.currentStatus?.value ?? null;
  }
  get currentImportance(): string | null {
    return this.props.currentImportance?.value ?? null;
  }

  update(fields: {
    userId?: string;
    teamId?: string;
    source?: string;
    subject?: string;
  }): void {
    if (fields.subject !== undefined && !fields.subject.trim()) {
      throw new DomainError('Assunto é obrigatório.', 'INVALID_LEAD_SUBJECT');
    }
    this.props = {
      ...this.props,
      ...(fields.userId !== undefined ? { userId: fields.userId } : {}),
      ...(fields.teamId !== undefined ? { teamId: fields.teamId } : {}),
      ...(fields.source !== undefined
        ? { source: LeadSource.create(fields.source) }
        : {}),
      ...(fields.subject !== undefined
        ? { subject: fields.subject.trim() }
        : {}),
    };
  }
}
