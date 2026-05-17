import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';

export type LeadDocument = HydratedDocument<LeadSchemaClass>;

@Schema({ collection: 'leads', timestamps: true })
export class LeadSchemaClass {
  @Prop({ type: String, default: () => randomUUID() })
  _id!: string;

  @Prop({ required: true })
  teamId!: string;

  @Prop({ required: true })
  lojaId!: string;

  @Prop({ required: true })
  clientId!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  source!: string;

  @Prop({ required: true })
  subject!: string;

  @Prop({ type: String, default: null })
  currentStatus!: string | null;

  @Prop({ type: String, default: null })
  currentImportance!: string | null;
}

export const LeadSchema = SchemaFactory.createForClass(LeadSchemaClass);

LeadSchema.index({ userId: 1 }, { name: 'idx_leads_userId' });
LeadSchema.index({ lojaId: 1 }, { name: 'idx_leads_lojaId' });
LeadSchema.index({ teamId: 1 }, { name: 'idx_leads_teamId' });
LeadSchema.index({ currentStatus: 1 }, { name: 'idx_leads_currentStatus' });
