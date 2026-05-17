import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClienteSchemaClass, ClienteSchema } from './infrastructure/database/mongoose/cliente.schema';
import { MongooseClienteRepository } from './infrastructure/database/repos/mongoose-cliente.repository';
import { CLIENTE_REPOSITORY } from './domain/repositories/cliente-repository.interface';
import { CreateClienteUseCase } from './application/use-cases/create-cliente.use-case';
import { FindClienteUseCase } from './application/use-cases/find-cliente.use-case';
import { ListClientesUseCase } from './application/use-cases/list-clientes.use-case';
import { UpdateClienteUseCase } from './application/use-cases/update-cliente.use-case';
import { DeleteClienteUseCase } from './application/use-cases/delete-cliente.use-case';
import { ClientesController } from './infrastructure/http/clientes.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClienteSchemaClass.name, schema: ClienteSchema },
    ]),
  ],
  controllers: [ClientesController],
  providers: [
    { provide: CLIENTE_REPOSITORY, useClass: MongooseClienteRepository },
    CreateClienteUseCase,
    FindClienteUseCase,
    ListClientesUseCase,
    UpdateClienteUseCase,
    DeleteClienteUseCase,
  ],
  exports: [CLIENTE_REPOSITORY],
})
export class ClientesModule {}
