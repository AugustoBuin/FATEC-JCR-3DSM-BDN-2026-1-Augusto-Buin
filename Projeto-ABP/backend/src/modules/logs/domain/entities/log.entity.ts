import { Entity } from '@/shared/core/entity';

export const EVENT_TYPES = [
  'usuario.login',
  'usuario.created',
  'usuario.updated',
  'usuario.deleted',
  'lead.created',
  'lead.updated',
  'lead.deleted',
  'cliente.created',
  'cliente.updated',
  'cliente.deleted',
  'negociacao.created',
  'negociacao.updated',
  'loja.created',
  'loja.updated',
  'loja.deleted',
  'time.created',
  'time.updated',
  'time.deleted',
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

interface LogProps {
  userId: string;
  eventType: EventType;
  targetId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: Date;
}

export class LogEntity extends Entity<LogProps> {
  static create(props: Omit<LogProps, 'createdAt'>): LogEntity {
    return new LogEntity({ ...props, createdAt: new Date() });
  }

  static restore(props: LogProps, id: string): LogEntity {
    return new LogEntity(props, id);
  }

  get userId(): string {
    return this.props.userId;
  }
  get eventType(): EventType {
    return this.props.eventType;
  }
  get targetId(): string {
    return this.props.targetId;
  }
  get before(): Record<string, unknown> | null {
    return this.props.before;
  }
  get after(): Record<string, unknown> | null {
    return this.props.after;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
}
