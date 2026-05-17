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
import { OpenNegociacaoDto } from '../dtos/open-negociacao.dto';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class OpenNegociacaoUseCase {
  constructor(
    @Inject(NEGOCIACAO_REPOSITORY)
    private readonly negociacaoRepository: INegociacaoRepository,
    @Inject(LEAD_REPOSITORY) private readonly leadRepository: ILeadRepository,
    private readonly logService: LogService,
  ) {}

  async execute(
    dto: OpenNegociacaoDto,
    actorId: string,
  ): Promise<NegociacaoEntity> {
    const lead = await this.leadRepository.findById(dto.leadId);
    if (!lead) throw new DomainError('Lead não encontrado.', 'LEAD_NOT_FOUND');

    const existing = await this.negociacaoRepository.findOpenByLeadId(
      dto.leadId,
    );
    if (existing) {
      throw new DomainError(
        'Já existe uma negociação aberta para este lead.',
        'NEGOTIATION_ALREADY_OPEN',
      );
    }

    const negociacao = NegociacaoEntity.open({
      leadId: dto.leadId,
      status: dto.status,
      importance: dto.importance,
    });

    await this.negociacaoRepository.save(negociacao);
    await this.leadRepository.updateDenormalized(
      dto.leadId,
      dto.status,
      dto.importance,
    );
    await this.logService.record(
      actorId,
      'negociacao.created',
      negociacao.id,
      null,
      {
        leadId: negociacao.leadId,
        status: negociacao.status,
        importance: negociacao.importance,
      },
    );

    return negociacao;
  }
}
