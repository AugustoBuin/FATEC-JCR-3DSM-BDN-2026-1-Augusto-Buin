import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';

@Schema({ _id: false })
class HistoricoEntrySchemaClass {
  @Prop({ required: true }) previousStatus!: string;
  @Prop({ required: true }) previousImportance!: string;
  @Prop({ required: true }) newStatus!: string;
  @Prop({ required: true }) newImportance!: string;
  @Prop({ type: String, default: null }) notes!: string | null;
  @Prop({ required: true }) changedAt!: Date;
  @Prop({ required: true }) changedBy!: string;
}

const HistoricoEntrySchema = SchemaFactory.createForClass(
  HistoricoEntrySchemaClass,
);

export type NegociacaoDocument = HydratedDocument<NegociacaoSchemaClass>;

@Schema({ collection: 'negociacoes', timestamps: true })
export class NegociacaoSchemaClass {
  @Prop({ type: String, default: () => randomUUID() })
  _id!: string;

  @Prop({ required: true })
  leadId!: string;

  @Prop({ required: true })
  status!: string;

  @Prop({ required: true })
  importance!: string;

  @Prop({ required: true, default: true })
  isOpen!: boolean;

  @Prop({ type: String, default: null })
  motivoEncerramento!: string | null;

  @Prop({ type: [HistoricoEntrySchema], default: [] })
  historico!: HistoricoEntrySchemaClass[];
}

export const NegociacaoSchema = SchemaFactory.createForClass(
  NegociacaoSchemaClass,
);

NegociacaoSchema.index(
  { leadId: 1 },
  {
    unique: true,
    partialFilterExpression: { isOpen: true },
    name: 'idx_negociacoes_one_active_per_lead',
  },
);
NegociacaoSchema.index(
  { importance: 1 },
  { name: 'idx_negociacoes_importance' },
);
NegociacaoSchema.index({ status: 1 }, { name: 'idx_negociacoes_status' });
