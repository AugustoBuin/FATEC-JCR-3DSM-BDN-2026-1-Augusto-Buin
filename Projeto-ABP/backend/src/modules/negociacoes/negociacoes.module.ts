import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  NegociacaoSchemaClass,
  NegociacaoSchema,
} from './infrastructure/database/mongoose/negociacao.schema';
import { MongooseNegociacaoRepository } from './infrastructure/database/repos/mongoose-negociacao.repository';
import { NEGOCIACAO_REPOSITORY } from './domain/repositories/negociacao-repository.interface';
import { OpenNegociacaoUseCase } from './application/use-cases/open-negociacao.use-case';
import { FindNegociacaoUseCase } from './application/use-cases/find-negociacao.use-case';
import { ListNegociacoesByLeadUseCase } from './application/use-cases/list-negociacoes-by-lead.use-case';
import { UpdateNegociacaoUseCase } from './application/use-cases/update-negociacao.use-case';
import { CloseNegociacaoUseCase } from './application/use-cases/close-negociacao.use-case';
import { NegociacoesController } from './infrastructure/http/negociacoes.controller';
import { LeadsModule } from '@/modules/leads/leads.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NegociacaoSchemaClass.name, schema: NegociacaoSchema },
    ]),
    LeadsModule,
  ],
  controllers: [NegociacoesController],
  providers: [
    { provide: NEGOCIACAO_REPOSITORY, useClass: MongooseNegociacaoRepository },
    OpenNegociacaoUseCase,
    FindNegociacaoUseCase,
    ListNegociacoesByLeadUseCase,
    UpdateNegociacaoUseCase,
    CloseNegociacaoUseCase,
  ],
})
export class NegociacoesModule {}
