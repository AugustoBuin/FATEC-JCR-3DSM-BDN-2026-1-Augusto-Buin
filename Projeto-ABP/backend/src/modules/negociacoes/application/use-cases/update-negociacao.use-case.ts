import { Inject, Injectable } from '@nestjs/common';
import { NegociacaoEntity } from '../../domain/entities/negociacao.entity';
import {
  INegociacaoRepository,
  NEGOCIACAO_REPOSITORY,
} from '../../domain/repositories/negociacao-repository.interface';
import {
  ILeadRepository,
  LEAD_REPOSITORY,
} from '@/modules/leads/domain/repositories/lead-repository.interface';
import { LogService } from '@/modules/logs/application/log.service';
import { UpdateNegociacaoDto } from '../dtos/update-negociacao.dto';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class UpdateNegociacaoUseCase {
  constructor(
    @Inject(NEGOCIACAO_REPOSITORY)
    private readonly negociacaoRepository: INegociacaoRepository,
    @Inject(LEAD_REPOSITORY) private readonly leadRepository: ILeadRepository,
    private readonly logService: LogService,
  ) {}

  async execute(
    id: string,
    dto: UpdateNegociacaoDto,
    changedBy: string,
  ): Promise<NegociacaoEntity> {
    const negociacao = await this.negociacaoRepository.findById(id);
    if (!negociacao)
      throw new DomainError(
        'Negociação não encontrada.',
        'NEGOCIACAO_NOT_FOUND',
      );

    if (
      dto.status === undefined &&
      dto.importance === undefined &&
      dto.notes === undefined
    ) {
      return negociacao;
    }

    const newStatus = dto.status ?? negociacao.status;
    const newImportance = dto.importance ?? negociacao.importance;

    const before = {
      status: negociacao.status,
      importance: negociacao.importance,
    };
    negociacao.recordChange({
      newStatus,
      newImportance,
      notes: dto.notes ?? null,
      changedBy,
    });

    await this.negociacaoRepository.save(negociacao);
    await this.leadRepository.updateDenormalized(
      negociacao.leadId,
      newStatus,
      newImportance,
    );
    await this.logService.record(
      changedBy,
      'negociacao.updated',
      negociacao.id,
      before,
      {
        status: negociacao.status,
        importance: negociacao.importance,
      },
    );

    return negociacao;
  }
}
