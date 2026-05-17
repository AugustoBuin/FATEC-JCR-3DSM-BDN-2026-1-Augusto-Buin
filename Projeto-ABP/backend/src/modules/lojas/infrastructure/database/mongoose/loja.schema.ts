import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';

export type LojaDocument = HydratedDocument<LojaSchemaClass>;

@Schema({ collection: 'lojas', timestamps: true })
export class LojaSchemaClass {
  @Prop({ type: String, default: () => randomUUID() })
  _id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  city!: string;

  @Prop()
  address?: string;

  @Prop()
  phone?: string;
}

export const LojaSchema = SchemaFactory.createForClass(LojaSchemaClass);
