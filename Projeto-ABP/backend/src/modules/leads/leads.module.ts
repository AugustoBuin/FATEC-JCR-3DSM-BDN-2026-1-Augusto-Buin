import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  LeadSchemaClass,
  LeadSchema,
} from './infrastructure/database/mongoose/lead.schema';
import { MongooseLeadRepository } from './infrastructure/database/repos/mongoose-lead.repository';
import { LEAD_REPOSITORY } from './domain/repositories/lead-repository.interface';
import { CreateLeadUseCase } from './application/use-cases/create-lead.use-case';
import { FindLeadUseCase } from './application/use-cases/find-lead.use-case';
import { ListLeadsUseCase } from './application/use-cases/list-leads.use-case';
import { UpdateLeadUseCase } from './application/use-cases/update-lead.use-case';
import { DeleteLeadUseCase } from './application/use-cases/delete-lead.use-case';
import { LeadsController } from './infrastructure/http/leads.controller';
import { LojasModule } from '@/modules/lojas/lojas.module';
import { TimesModule } from '@/modules/times/times.module';
import { ClientesModule } from '@/modules/clientes/clientes.module';
import { UsuariosModule } from '@/modules/usuarios/usuarios.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeadSchemaClass.name, schema: LeadSchema },
    ]),
    LojasModule,
    TimesModule,
    ClientesModule,
    UsuariosModule,
  ],
  controllers: [LeadsController],
  providers: [
    { provide: LEAD_REPOSITORY, useClass: MongooseLeadRepository },
    CreateLeadUseCase,
    FindLeadUseCase,
    ListLeadsUseCase,
    UpdateLeadUseCase,
    DeleteLeadUseCase,
  ],
  exports: [LEAD_REPOSITORY],
})
export class LeadsModule {}
