import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import { CreateLeadUseCase } from '../../application/use-cases/create-lead.use-case';
import { FindLeadUseCase } from '../../application/use-cases/find-lead.use-case';
import { ListLeadsUseCase } from '../../application/use-cases/list-leads.use-case';
import { UpdateLeadUseCase } from '../../application/use-cases/update-lead.use-case';
import { DeleteLeadUseCase } from '../../application/use-cases/delete-lead.use-case';
import {
  createLeadSchema,
  CreateLeadDto,
} from '../../application/dtos/create-lead.dto';
import {
  updateLeadSchema,
  UpdateLeadDto,
} from '../../application/dtos/update-lead.dto';
import { LeadEntity } from '../../domain/entities/lead.entity';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { DomainError } from '@/shared/errors/domain-error';
import { Roles } from '@/shared/auth/roles.decorator';
import { CurrentUser, JwtPayload } from '@/shared/auth/current-user.decorator';

@Controller('leads')
export class LeadsController {
  constructor(
    private readonly createLead: CreateLeadUseCase,
    private readonly findLead: FindLeadUseCase,
    private readonly listLeads: ListLeadsUseCase,
    private readonly updateLead: UpdateLeadUseCase,
    private readonly deleteLead: DeleteLeadUseCase,
  ) {}

  @Post()
  @Roles('admin', 'gerente geral', 'gerente de equipe', 'atendente')
  @UsePipes(new ZodValidationPipe(createLeadSchema))
  async create(@Body() dto: CreateLeadDto, @CurrentUser() user: JwtPayload) {
    try {
      return this.toResponse(await this.createLead.execute(dto, user.sub));
    } catch (error) {
      if (
        error instanceof DomainError &&
        (error.code === 'LOJA_NOT_FOUND' ||
          error.code === 'TIME_NOT_FOUND' ||
          error.code === 'CLIENTE_NOT_FOUND' ||
          error.code === 'USER_NOT_FOUND')
      ) {
        throw new NotFoundException(error.message);
      }
      if (
        error instanceof DomainError &&
        (error.code === 'INVALID_LEAD_SUBJECT' ||
          error.code === 'INVALID_LEAD_SOURCE')
      ) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get()
  async list(
    @Query('lojaId') lojaId?: string,
    @Query('teamId') teamId?: string,
    @Query('userId') userId?: string,
    @Query('currentStatus') currentStatus?: string,
  ) {
    const leads = await this.listLeads.execute({
      lojaId,
      teamId,
      userId,
      currentStatus,
    });
    return leads.map((l) => this.toResponse(l));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return this.toResponse(await this.findLead.execute(id));
    } catch (error) {
      if (error instanceof DomainError && error.code === 'LEAD_NOT_FOUND') {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Put(':id')
  @Roles('admin', 'gerente geral', 'gerente de equipe', 'atendente')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLeadSchema)) dto: UpdateLeadDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      return this.toResponse(await this.updateLead.execute(id, dto, user.sub));
    } catch (error) {
      if (
        error instanceof DomainError &&
        (error.code === 'LEAD_NOT_FOUND' ||
          error.code === 'TIME_NOT_FOUND' ||
          error.code === 'USER_NOT_FOUND')
      ) {
        throw new NotFoundException(error.message);
      }
      if (
        error instanceof DomainError &&
        (error.code === 'INVALID_LEAD_SUBJECT' ||
          error.code === 'INVALID_LEAD_SOURCE')
      ) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Delete(':id')
  @Roles('admin', 'gerente geral')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    try {
      await this.deleteLead.execute(id, user.sub);
    } catch (error) {
      if (error instanceof DomainError && error.code === 'LEAD_NOT_FOUND') {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  private toResponse(lead: LeadEntity) {
    return {
      id: lead.id,
      teamId: lead.teamId,
      lojaId: lead.lojaId,
      clientId: lead.clientId,
      userId: lead.userId,
      source: lead.source,
      subject: lead.subject,
      currentStatus: lead.currentStatus,
      currentImportance: lead.currentImportance,
    };
  }
}
