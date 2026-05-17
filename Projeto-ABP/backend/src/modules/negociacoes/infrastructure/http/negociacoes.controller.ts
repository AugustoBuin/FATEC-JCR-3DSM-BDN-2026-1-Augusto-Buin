import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { OpenNegociacaoUseCase } from '../../application/use-cases/open-negociacao.use-case';
import { FindNegociacaoUseCase } from '../../application/use-cases/find-negociacao.use-case';
import { ListNegociacoesByLeadUseCase } from '../../application/use-cases/list-negociacoes-by-lead.use-case';
import { UpdateNegociacaoUseCase } from '../../application/use-cases/update-negociacao.use-case';
import { CloseNegociacaoUseCase } from '../../application/use-cases/close-negociacao.use-case';
import {
  openNegociacaoSchema,
  OpenNegociacaoDto,
} from '../../application/dtos/open-negociacao.dto';
import {
  updateNegociacaoSchema,
  UpdateNegociacaoDto,
} from '../../application/dtos/update-negociacao.dto';
import {
  closeNegociacaoSchema,
  CloseNegociacaoDto,
} from '../../application/dtos/close-negociacao.dto';
import { NegociacaoEntity } from '../../domain/entities/negociacao.entity';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { DomainError } from '@/shared/errors/domain-error';
import { Roles } from '@/shared/auth/roles.decorator';
import { CurrentUser, JwtPayload } from '@/shared/auth/current-user.decorator';

@Controller('negociacoes')
export class NegociacoesController {
  constructor(
    private readonly openNegociacao: OpenNegociacaoUseCase,
    private readonly findNegociacao: FindNegociacaoUseCase,
    private readonly listNegociacoesByLead: ListNegociacoesByLeadUseCase,
    private readonly updateNegociacao: UpdateNegociacaoUseCase,
    private readonly closeNegociacao: CloseNegociacaoUseCase,
  ) {}

  @Post()
  @Roles('admin', 'gerente geral', 'gerente de equipe', 'atendente')
  async open(
    @Body(new ZodValidationPipe(openNegociacaoSchema)) dto: OpenNegociacaoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      return this.toResponse(await this.openNegociacao.execute(dto, user.sub));
    } catch (error) {
      if (error instanceof DomainError && error.code === 'LEAD_NOT_FOUND') {
        throw new NotFoundException(error.message);
      }
      if (
        error instanceof DomainError &&
        error.code === 'NEGOTIATION_ALREADY_OPEN'
      ) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Get()
  async list(@Query('leadId') leadId?: string) {
    if (!leadId) throw new BadRequestException('leadId é obrigatório.');
    const negociacoes = await this.listNegociacoesByLead.execute(leadId);
    return negociacoes.map((n) => this.toResponse(n));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return this.toResponse(await this.findNegociacao.execute(id));
    } catch (error) {
      if (
        error instanceof DomainError &&
        error.code === 'NEGOCIACAO_NOT_FOUND'
      ) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Put(':id')
  @Roles('admin', 'gerente geral', 'gerente de equipe', 'atendente')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateNegociacaoSchema))
    dto: UpdateNegociacaoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      return this.toResponse(
        await this.updateNegociacao.execute(id, dto, user.sub),
      );
    } catch (error) {
      if (
        error instanceof DomainError &&
        error.code === 'NEGOCIACAO_NOT_FOUND'
      ) {
        throw new NotFoundException(error.message);
      }
      if (
        error instanceof DomainError &&
        error.code === 'NEGOTIATION_ALREADY_CLOSED'
      ) {
        throw new ConflictException(error.message);
      }
      if (
        error instanceof DomainError &&
        (error.code === 'INVALID_NEGOTIATION_STATUS' ||
          error.code === 'INVALID_NEGOTIATION_IMPORTANCE')
      ) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Post(':id/close')
  @HttpCode(200)
  @Roles('admin', 'gerente geral', 'gerente de equipe', 'atendente')
  async close(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(closeNegociacaoSchema)) dto: CloseNegociacaoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      return this.toResponse(
        await this.closeNegociacao.execute(id, dto, user.sub),
      );
    } catch (error) {
      if (
        error instanceof DomainError &&
        error.code === 'NEGOCIACAO_NOT_FOUND'
      ) {
        throw new NotFoundException(error.message);
      }
      if (
        error instanceof DomainError &&
        error.code === 'NEGOTIATION_ALREADY_CLOSED'
      ) {
        throw new ConflictException(error.message);
      }
      if (
        error instanceof DomainError &&
        error.code === 'INVALID_MOTIVO_ENCERRAMENTO'
      ) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  private toResponse(negociacao: NegociacaoEntity) {
    return {
      id: negociacao.id,
      leadId: negociacao.leadId,
      status: negociacao.status,
      importance: negociacao.importance,
      isOpen: negociacao.isOpen,
      motivoEncerramento: negociacao.motivoEncerramento,
      historico: negociacao.historico,
    };
  }
}
