import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';

export type TimeDocument = HydratedDocument<TimeSchemaClass>;

@Schema({ collection: 'times', timestamps: true })
export class TimeSchemaClass {
  @Prop({ type: String, default: () => randomUUID() })
  _id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, index: true })
  lojaId!: string;
}

export const TimeSchema = SchemaFactory.createForClass(TimeSchemaClass);
