import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITimeRepository } from '../../../domain/repositories/time-repository.interface';
import { TimeEntity } from '../../../domain/entities/time.entity';
import { TimeSchemaClass, TimeDocument } from '../mongoose/time.schema';

interface TimeDoc {
  _id: string;
  name: string;
  lojaId: string;
}

@Injectable()
export class MongooseTimeRepository implements ITimeRepository {
  constructor(
    @InjectModel(TimeSchemaClass.name)
    private readonly timeModel: Model<TimeDocument>,
  ) {}

  async findById(id: string): Promise<TimeEntity | null> {
    const doc = await this.timeModel.findById(id).lean<TimeDoc>().exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findAll(lojaId?: string): Promise<TimeEntity[]> {
    const filter = lojaId ? { lojaId } : {};
    const docs = await this.timeModel.find(filter).lean<TimeDoc[]>().exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async save(time: TimeEntity): Promise<void> {
    await this.timeModel
      .findByIdAndUpdate(
        time.id,
        { _id: time.id, name: time.name, lojaId: time.lojaId },
        { upsert: true, new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.timeModel.findByIdAndDelete(id).exec();
  }

  private toEntity(doc: TimeDoc): TimeEntity {
    return TimeEntity.restore({ name: doc.name, lojaId: doc.lojaId }, doc._id);
  }
}
