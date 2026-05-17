import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { LojasModule } from './modules/lojas/lojas.module';
import { TimesModule } from './modules/times/times.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AuthModule } from './modules/auth/auth.module';
import { LeadsModule } from './modules/leads/leads.module';
import { NegociacoesModule } from './modules/negociacoes/negociacoes.module';
import { LogsModule } from './modules/logs/logs.module';
import { JwtGuard } from './shared/auth/jwt.guard';
import { RolesGuard } from './shared/auth/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
    LojasModule,
    TimesModule,
    ClientesModule,
    UsuariosModule,
    AuthModule,
    LeadsModule,
    NegociacoesModule,
    LogsModule,
  ],
  controllers: [AppController],
  providers: [
    // Order matters: JwtGuard runs first (attaches request.user), then RolesGuard reads it.
    // Reversing this order would cause RolesGuard to see request.user as undefined and throw 403 instead of 401.
    { provide: APP_GUARD, useClass: JwtGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
