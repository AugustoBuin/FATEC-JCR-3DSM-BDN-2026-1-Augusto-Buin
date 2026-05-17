import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { INegociacaoRepository } from '../../../domain/repositories/negociacao-repository.interface';
import {
  NegociacaoEntity,
  HistoricoEntry,
} from '../../../domain/entities/negociacao.entity';
import {
  NegociacaoSchemaClass,
  NegociacaoDocument,
} from '../mongoose/negociacao.schema';
import { DomainError } from '@/shared/errors/domain-error';

interface NegociacaoDoc {
  _id: string;
  leadId: string;
  status: string;
  importance: string;
  isOpen: boolean;
  motivoEncerramento: string | null;
  historico: HistoricoEntry[];
}

@Injectable()
export class MongooseNegociacaoRepository implements INegociacaoRepository {
  constructor(
    @InjectModel(NegociacaoSchemaClass.name)
    private readonly negociacaoModel: Model<NegociacaoDocument>,
  ) {}

  async findById(id: string): Promise<NegociacaoEntity | null> {
    const doc = await this.negociacaoModel
      .findById(id)
      .lean<NegociacaoDoc>()
      .exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByLeadId(leadId: string): Promise<NegociacaoEntity[]> {
    const docs = await this.negociacaoModel
      .find({ leadId })
      .lean<NegociacaoDoc[]>()
      .exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async findOpenByLeadId(leadId: string): Promise<NegociacaoEntity | null> {
    const doc = await this.negociacaoModel
      .findOne({ leadId, isOpen: true })
      .lean<NegociacaoDoc>()
      .exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async save(negociacao: NegociacaoEntity): Promise<void> {
    try {
      await this.negociacaoModel
        .findByIdAndUpdate(
          negociacao.id,
          {
            _id: negociacao.id,
            leadId: negociacao.leadId,
            status: negociacao.status,
            importance: negociacao.importance,
            isOpen: negociacao.isOpen,
            motivoEncerramento: negociacao.motivoEncerramento,
            historico: negociacao.historico,
          },
          { upsert: true, new: true },
        )
        .exec();
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: number }).code === 11000
      ) {
        throw new DomainError(
          'Já existe uma negociação aberta para este lead.',
          'NEGOTIATION_ALREADY_OPEN',
        );
      }
      throw err;
    }
  }

  private toEntity(doc: NegociacaoDoc): NegociacaoEntity {
    return NegociacaoEntity.restore(
      {
        leadId: doc.leadId,
        status: doc.status,
        importance: doc.importance,
        isOpen: doc.isOpen,
        motivoEncerramento: doc.motivoEncerramento,
        historico: doc.historico.map((entry) => ({
          ...entry,
          changedAt: new Date(entry.changedAt),
        })),
      },
      doc._id,
    );
  }
}
