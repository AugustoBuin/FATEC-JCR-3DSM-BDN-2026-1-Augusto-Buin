import { Module } from '@nestjs/common';
import { UsuariosModule } from '@/modules/usuarios/usuarios.module';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { AuthController } from './infrastructure/http/auth.controller';

@Module({
  imports: [UsuariosModule],
  controllers: [AuthController],
  providers: [LoginUseCase],
})
export class AuthModule {}
