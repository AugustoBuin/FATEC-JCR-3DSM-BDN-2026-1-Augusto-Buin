import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY,
} from '@/modules/usuarios/domain/repositories/usuario-repository.interface';
import { LogService } from '@/modules/logs/application/log.service';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly jwtService: JwtService,
    private readonly logService: LogService,
  ) {}

  async execute(dto: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string }> {
    const usuario = await this.usuarioRepository.findByEmail(dto.email);
    if (!usuario) {
      throw new DomainError('Credenciais inválidas.', 'INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!valid) {
      throw new DomainError('Credenciais inválidas.', 'INVALID_CREDENTIALS');
    }

    const accessToken = this.jwtService.sign({
      sub: usuario.id,
      role: usuario.role,
    });

    await this.logService.record(
      usuario.id,
      'usuario.login',
      usuario.id,
      null,
      {
        email: usuario.email,
        role: usuario.role,
      },
    );

    return { accessToken };
  }
}
