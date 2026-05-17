import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';

export type ClienteDocument = HydratedDocument<ClienteSchemaClass>;

@Schema({ collection: 'clientes', timestamps: true })
export class ClienteSchemaClass {
  @Prop({ type: String, default: () => randomUUID() })
  _id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  phone!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ type: String, unique: true, sparse: true })
  cpf?: string;

  @Prop({ type: String })
  address?: string;
}

export const ClienteSchema = SchemaFactory.createForClass(ClienteSchemaClass);
