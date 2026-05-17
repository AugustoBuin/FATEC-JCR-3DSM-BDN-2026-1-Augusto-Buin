import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { EVENT_TYPES, EventType } from '../../../domain/entities/log.entity';

export type LogDocument = HydratedDocument<LogSchemaClass>;

@Schema({ collection: 'logs', timestamps: false })
export class LogSchemaClass {
  @Prop({ type: String, default: () => randomUUID() })
  _id!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true, enum: EVENT_TYPES })
  eventType!: EventType;

  @Prop({ required: true })
  targetId!: string;

  @Prop({ type: Object, default: null })
  before!: Record<string, unknown> | null;

  @Prop({ type: Object, default: null })
  after!: Record<string, unknown> | null;

  @Prop({ required: true, type: Date, default: () => new Date() })
  createdAt!: Date;
}

export const LogSchema = SchemaFactory.createForClass(LogSchemaClass);

LogSchema.index({ userId: 1 });
LogSchema.index({ eventType: 1 });
LogSchema.index({ targetId: 1 });
LogSchema.index({ createdAt: -1 });
