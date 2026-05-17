import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUsuarioRepository } from '../../../domain/repositories/usuario-repository.interface';
import { UsuarioEntity } from '../../../domain/entities/usuario.entity';
import {
  UsuarioSchemaClass,
  UsuarioDocument,
} from '../mongoose/usuario.schema';

interface UsuarioDoc {
  _id: string;
  name: string;
  email: string;
  role: string;
  passwordHash: string;
  teamId: string | null;
}

@Injectable()
export class MongooseUsuarioRepository implements IUsuarioRepository {
  constructor(
    @InjectModel(UsuarioSchemaClass.name)
    private readonly usuarioModel: Model<UsuarioDocument>,
  ) {}

  async findById(id: string): Promise<UsuarioEntity | null> {
    const doc = await this.usuarioModel.findById(id).lean<UsuarioDoc>().exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByEmail(email: string): Promise<UsuarioEntity | null> {
    const doc = await this.usuarioModel
      .findOne({ email: email.trim().toLowerCase() })
      .lean<UsuarioDoc>()
      .exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findAll(): Promise<UsuarioEntity[]> {
    const docs = await this.usuarioModel.find().lean<UsuarioDoc[]>().exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async save(usuario: UsuarioEntity): Promise<void> {
    await this.usuarioModel
      .findByIdAndUpdate(
        usuario.id,
        {
          _id: usuario.id,
          name: usuario.name,
          email: usuario.email,
          role: usuario.role,
          passwordHash: usuario.passwordHash,
          teamId: usuario.teamId,
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.usuarioModel.findByIdAndDelete(id).exec();
  }

  private toEntity(doc: UsuarioDoc): UsuarioEntity {
    return UsuarioEntity.restore(
      {
        name: doc.name,
        email: doc.email,
        role: doc.role,
        passwordHash: doc.passwordHash,
        teamId: doc.teamId,
      },
      doc._id,
    );
  }
}
