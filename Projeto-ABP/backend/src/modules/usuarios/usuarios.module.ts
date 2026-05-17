import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UsuarioSchemaClass,
  UsuarioSchema,
} from './infrastructure/database/mongoose/usuario.schema';
import { MongooseUsuarioRepository } from './infrastructure/database/repos/mongoose-usuario.repository';
import { USUARIO_REPOSITORY } from './domain/repositories/usuario-repository.interface';
import { CreateUsuarioUseCase } from './application/use-cases/create-usuario.use-case';
import { FindUsuarioUseCase } from './application/use-cases/find-usuario.use-case';
import { FindUsuarioByEmailUseCase } from './application/use-cases/find-usuario-by-email.use-case';
import { ListUsuariosUseCase } from './application/use-cases/list-usuarios.use-case';
import { UpdateUsuarioUseCase } from './application/use-cases/update-usuario.use-case';
import { DeleteUsuarioUseCase } from './application/use-cases/delete-usuario.use-case';
import { UsuariosController } from './infrastructure/http/usuarios.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UsuarioSchemaClass.name, schema: UsuarioSchema },
    ]),
  ],
  controllers: [UsuariosController],
  providers: [
    { provide: USUARIO_REPOSITORY, useClass: MongooseUsuarioRepository },
    CreateUsuarioUseCase,
    FindUsuarioUseCase,
    FindUsuarioByEmailUseCase,
    ListUsuariosUseCase,
    UpdateUsuarioUseCase,
    DeleteUsuarioUseCase,
  ],
  exports: [USUARIO_REPOSITORY],
})
export class UsuariosModule {}
