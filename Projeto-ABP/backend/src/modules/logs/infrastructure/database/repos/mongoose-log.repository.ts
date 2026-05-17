import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LogEntity } from '../../../domain/entities/log.entity';
import {
  ILogRepository,
  LogFilters,
} from '../../../domain/repositories/log-repository.interface';
import { LogSchemaClass, LogDocument } from '../mongoose/log.schema';

@Injectable()
export class MongooseLogRepository implements ILogRepository {
  constructor(
    @InjectModel(LogSchemaClass.name)
    private readonly logModel: Model<LogDocument>,
  ) {}

  async save(log: LogEntity): Promise<void> {
    await this.logModel.create({
      _id: log.id,
      userId: log.userId,
      eventType: log.eventType,
      targetId: log.targetId,
      before: log.before,
      after: log.after,
      createdAt: log.createdAt,
    });
  }

  async findAll(filters?: LogFilters): Promise<LogEntity[]> {
    const query: Record<string, unknown> = {};
    if (filters?.userId) query.userId = filters.userId;
    if (filters?.eventType) query.eventType = filters.eventType;
    if (filters?.targetId) query.targetId = filters.targetId;

    const docs = await this.logModel.find(query).sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toEntity(d));
  }

  async findById(id: string): Promise<LogEntity | null> {
    const doc = await this.logModel.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  private toEntity(doc: LogDocument): LogEntity {
    return LogEntity.restore(
      {
        userId: doc.userId,
        eventType: doc.eventType,
        targetId: doc.targetId,
        before: doc.before,
        after: doc.after,
        createdAt: new Date(doc.createdAt),
      },
      doc._id,
    );
  }
}
