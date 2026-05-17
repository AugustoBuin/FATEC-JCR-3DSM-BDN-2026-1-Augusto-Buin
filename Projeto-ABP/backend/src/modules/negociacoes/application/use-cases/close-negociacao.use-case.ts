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
import { CloseNegociacaoDto } from '../dtos/close-negociacao.dto';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class CloseNegociacaoUseCase {
  constructor(
    @Inject(NEGOCIACAO_REPOSITORY)
    private readonly negociacaoRepository: INegociacaoRepository,
    @Inject(LEAD_REPOSITORY) private readonly leadRepository: ILeadRepository,
    private readonly logService: LogService,
  ) {}

  async execute(
    id: string,
    dto: CloseNegociacaoDto,
    actorId: string,
  ): Promise<NegociacaoEntity> {
    const negociacao = await this.negociacaoRepository.findById(id);
    if (!negociacao)
      throw new DomainError(
        'Negociação não encontrada.',
        'NEGOCIACAO_NOT_FOUND',
      );

    const before = {
      status: negociacao.status,
      importance: negociacao.importance,
      isOpen: negociacao.isOpen,
    };
    negociacao.close(dto.motivoEncerramento);

    await this.negociacaoRepository.save(negociacao);
    await this.leadRepository.updateDenormalized(
      negociacao.leadId,
      negociacao.status,
      negociacao.importance,
    );
    await this.logService.record(
      actorId,
      'negociacao.updated',
      negociacao.id,
      before,
      {
        status: negociacao.status,
        importance: negociacao.importance,
        isOpen: negociacao.isOpen,
        motivoEncerramento: negociacao.motivoEncerramento,
      },
    );

    return negociacao;
  }
}
