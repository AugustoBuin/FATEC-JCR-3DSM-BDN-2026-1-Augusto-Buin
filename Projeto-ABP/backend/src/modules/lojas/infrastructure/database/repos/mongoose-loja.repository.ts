import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ILojaRepository } from '../../../domain/repositories/loja-repository.interface';
import { LojaEntity } from '../../../domain/entities/loja.entity';
import { LojaSchemaClass, LojaDocument } from '../mongoose/loja.schema';

interface LojaDoc {
  _id: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
}

@Injectable()
export class MongooseLojaRepository implements ILojaRepository {
  constructor(
    @InjectModel(LojaSchemaClass.name)
    private readonly lojaModel: Model<LojaDocument>,
  ) {}

  async findById(id: string): Promise<LojaEntity | null> {
    const doc = await this.lojaModel.findById(id).lean<LojaDoc>().exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findAll(): Promise<LojaEntity[]> {
    const docs = await this.lojaModel.find().lean<LojaDoc[]>().exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async save(loja: LojaEntity): Promise<void> {
    await this.lojaModel
      .findByIdAndUpdate(
        loja.id,
        {
          _id: loja.id,
          name: loja.name,
          city: loja.city,
          address: loja.address,
          phone: loja.phone,
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.lojaModel.findByIdAndDelete(id).exec();
  }

  private toEntity(doc: LojaDoc): LojaEntity {
    return LojaEntity.restore(
      {
        name: doc.name,
        city: doc.city,
        address: doc.address,
        phone: doc.phone,
      },
      doc._id,
    );
  }
}
