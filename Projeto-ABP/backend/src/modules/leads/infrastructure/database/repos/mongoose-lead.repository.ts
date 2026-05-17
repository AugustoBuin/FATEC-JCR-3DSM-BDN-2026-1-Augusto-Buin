import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ILeadRepository,
  LeadFilters,
} from '../../../domain/repositories/lead-repository.interface';
import { LeadEntity } from '../../../domain/entities/lead.entity';
import { LeadSchemaClass, LeadDocument } from '../mongoose/lead.schema';

interface LeadDoc {
  _id: string;
  teamId: string;
  lojaId: string;
  clientId: string;
  userId: string;
  source: string;
  subject: string;
  currentStatus: string | null;
  currentImportance: string | null;
}

@Injectable()
export class MongooseLeadRepository implements ILeadRepository {
  constructor(
    @InjectModel(LeadSchemaClass.name)
    private readonly leadModel: Model<LeadDocument>,
  ) {}

  async findById(id: string): Promise<LeadEntity | null> {
    const doc = await this.leadModel.findById(id).lean<LeadDoc>().exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findAll(filters?: LeadFilters): Promise<LeadEntity[]> {
    const query: Record<string, unknown> = {};
    if (filters?.lojaId) query.lojaId = filters.lojaId;
    if (filters?.teamId) query.teamId = filters.teamId;
    if (filters?.userId) query.userId = filters.userId;
    if (filters?.currentStatus) query.currentStatus = filters.currentStatus;

    const docs = await this.leadModel.find(query).lean<LeadDoc[]>().exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async save(lead: LeadEntity): Promise<void> {
    await this.leadModel
      .findByIdAndUpdate(
        lead.id,
        {
          teamId: lead.teamId,
          lojaId: lead.lojaId,
          clientId: lead.clientId,
          userId: lead.userId,
          source: lead.source,
          subject: lead.subject,
          currentStatus: lead.currentStatus,
          currentImportance: lead.currentImportance,
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.leadModel.findByIdAndDelete(id).exec();
  }

  async updateDenormalized(
    id: string,
    currentStatus: string | null,
    currentImportance: string | null,
  ): Promise<void> {
    await this.leadModel
      .findByIdAndUpdate(id, { currentStatus, currentImportance })
      .exec();
  }

  private toEntity(doc: LeadDoc): LeadEntity {
    return LeadEntity.restore(
      {
        teamId: doc.teamId,
        lojaId: doc.lojaId,
        clientId: doc.clientId,
        userId: doc.userId,
        source: doc.source,
        subject: doc.subject,
        currentStatus: doc.currentStatus,
        currentImportance: doc.currentImportance,
      },
      doc._id,
    );
  }
}
