import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LojaSchemaClass, LojaSchema } from './infrastructure/database/mongoose/loja.schema';
import { MongooseLojaRepository } from './infrastructure/database/repos/mongoose-loja.repository';
import { LOJA_REPOSITORY } from './domain/repositories/loja-repository.interface';
import { CreateLojaUseCase } from './application/use-cases/create-loja.use-case';
import { FindLojaUseCase } from './application/use-cases/find-loja.use-case';
import { ListLojasUseCase } from './application/use-cases/list-lojas.use-case';
import { UpdateLojaUseCase } from './application/use-cases/update-loja.use-case';
import { DeleteLojaUseCase } from './application/use-cases/delete-loja.use-case';
import { LojasController } from './infrastructure/http/lojas.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LojaSchemaClass.name, schema: LojaSchema },
    ]),
  ],
  controllers: [LojasController],
  providers: [
    { provide: LOJA_REPOSITORY, useClass: MongooseLojaRepository },
    CreateLojaUseCase,
    FindLojaUseCase,
    ListLojasUseCase,
    UpdateLojaUseCase,
    DeleteLojaUseCase,
  ],
  exports: [LOJA_REPOSITORY],
})
export class LojasModule {}
