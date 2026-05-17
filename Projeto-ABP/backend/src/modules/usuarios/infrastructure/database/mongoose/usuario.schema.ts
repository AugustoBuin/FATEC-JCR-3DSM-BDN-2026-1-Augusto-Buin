import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';

export type UsuarioDocument = HydratedDocument<UsuarioSchemaClass>;

@Schema({ collection: 'usuarios', timestamps: true })
export class UsuarioSchemaClass {
  @Prop({ type: String, default: () => randomUUID() })
  _id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  role!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ type: String, default: null })
  teamId!: string | null;
}

export const UsuarioSchema = SchemaFactory.createForClass(UsuarioSchemaClass);
