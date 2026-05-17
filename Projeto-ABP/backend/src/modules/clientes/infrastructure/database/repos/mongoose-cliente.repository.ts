import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IClienteRepository } from '../../../domain/repositories/cliente-repository.interface';
import { ClienteEntity } from '../../../domain/entities/cliente.entity';
import { ClienteSchemaClass, ClienteDocument } from '../mongoose/cliente.schema';

interface ClienteDoc {
  _id: string;
  name: string;
  phone: string;
  email: string;
  cpf?: string;
  address?: string;
}

@Injectable()
export class MongooseClienteRepository implements IClienteRepository {
  constructor(
    @InjectModel(ClienteSchemaClass.name)
    private readonly clienteModel: Model<ClienteDocument>,
  ) {}

  async findById(id: string): Promise<ClienteEntity | null> {
    const doc = await this.clienteModel.findById(id).lean<ClienteDoc>().exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByPhone(phone: string): Promise<ClienteEntity | null> {
    const doc = await this.clienteModel.findOne({ phone }).lean<ClienteDoc>().exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByCpf(cpf: string): Promise<ClienteEntity | null> {
    const doc = await this.clienteModel.findOne({ cpf }).lean<ClienteDoc>().exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findAll(filters?: { phone?: string; cpf?: string }): Promise<ClienteEntity[]> {
    const filter: Record<string, string> = {};
    if (filters?.phone) filter.phone = filters.phone;
    if (filters?.cpf) filter.cpf = filters.cpf;
    const docs = await this.clienteModel.find(filter).lean<ClienteDoc[]>().exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async save(cliente: ClienteEntity): Promise<void> {
    await this.clienteModel
      .findByIdAndUpdate(
        cliente.id,
        {
          _id: cliente.id,
          name: cliente.name,
          phone: cliente.phone,
          email: cliente.email,
          cpf: cliente.cpf,
          address: cliente.address,
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.clienteModel.findByIdAndDelete(id).exec();
  }

  private toEntity(doc: ClienteDoc): ClienteEntity {
    return ClienteEntity.restore(
      {
        name: doc.name,
        phone: doc.phone,
        email: doc.email,
        cpf: doc.cpf,
        address: doc.address,
      },
      doc._id,
    );
  }
}
