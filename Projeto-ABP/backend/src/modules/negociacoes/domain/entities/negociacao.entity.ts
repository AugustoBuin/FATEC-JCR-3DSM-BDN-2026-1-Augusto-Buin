import { Entity } from '@/shared/core/entity';
import { DomainError } from '@/shared/errors/domain-error';
import { NegotiationStatus } from '@/shared/domain/value-objects/negotiation-status.vo';
import { NegotiationImportance } from '@/shared/domain/value-objects/negotiation-importance.vo';

export interface HistoricoEntry {
  previousStatus: string;
  previousImportance: string;
  newStatus: string;
  newImportance: string;
  notes: string | null;
  changedAt: Date;
  changedBy: string;
}

interface NegociacaoProps {
  leadId: string;
  status: NegotiationStatus;
  importance: NegotiationImportance;
  isOpen: boolean;
  motivoEncerramento: string | null;
  historico: HistoricoEntry[];
}

interface NegociacaoRestoreInput {
  leadId: string;
  status: string;
  importance: string;
  isOpen: boolean;
  motivoEncerramento: string | null;
  historico: HistoricoEntry[];
}

export class NegociacaoEntity extends Entity<NegociacaoProps> {
  static open(props: {
    leadId: string;
    status: string;
    importance: string;
  }): NegociacaoEntity {
    return new NegociacaoEntity({
      leadId: props.leadId,
      status: NegotiationStatus.create(props.status),
      importance: NegotiationImportance.create(props.importance),
      isOpen: true,
      motivoEncerramento: null,
      historico: [],
    });
  }

  static restore(props: NegociacaoRestoreInput, id: string): NegociacaoEntity {
    return new NegociacaoEntity(
      {
        ...props,
        status: NegotiationStatus.create(props.status),
        importance: NegotiationImportance.create(props.importance),
      },
      id,
    );
  }

  get leadId(): string {
    return this.props.leadId;
  }
  get status(): string {
    return this.props.status.value;
  }
  get importance(): string {
    return this.props.importance.value;
  }
  get isOpen(): boolean {
    return this.props.isOpen;
  }
  get motivoEncerramento(): string | null {
    return this.props.motivoEncerramento;
  }
  get historico(): HistoricoEntry[] {
    return [...this.props.historico];
  }

  recordChange(fields: {
    newStatus: string;
    newImportance: string;
    notes: string | null;
    changedBy: string;
  }): void {
    if (!this.props.isOpen) {
      throw new DomainError(
        'Negociação já está encerrada.',
        'NEGOTIATION_ALREADY_CLOSED',
      );
    }
    const newStatus = NegotiationStatus.create(fields.newStatus);
    const newImportance = NegotiationImportance.create(fields.newImportance);

    const entry: HistoricoEntry = {
      previousStatus: this.props.status.value,
      previousImportance: this.props.importance.value,
      newStatus: newStatus.value,
      newImportance: newImportance.value,
      notes: fields.notes,
      changedAt: new Date(),
      changedBy: fields.changedBy,
    };

    this.props = {
      ...this.props,
      status: newStatus,
      importance: newImportance,
      historico: [...this.props.historico, entry],
    };
  }

  close(motivoEncerramento: string): void {
    if (!this.props.isOpen) {
      throw new DomainError(
        'Negociação já está encerrada.',
        'NEGOTIATION_ALREADY_CLOSED',
      );
    }
    if (!motivoEncerramento?.trim()) {
      throw new DomainError(
        'Motivo de encerramento é obrigatório.',
        'INVALID_MOTIVO_ENCERRAMENTO',
      );
    }
    this.props = {
      ...this.props,
      isOpen: false,
      motivoEncerramento: motivoEncerramento.trim(),
    };
  }
}
