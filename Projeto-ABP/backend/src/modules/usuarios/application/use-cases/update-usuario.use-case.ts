import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY,
} from '../../domain/repositories/usuario-repository.interface';
import { UpdateUsuarioDto } from '../dtos/update-usuario.dto';
import { DomainError } from '@/shared/errors/domain-error';
import { LogService } from '@/modules/logs/application/log.service';

@Injectable()
export class UpdateUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly logService: LogService,
  ) {}

  async execute(
    id: string,
    dto: UpdateUsuarioDto,
    actorId: string,
  ): Promise<UsuarioEntity> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new DomainError('Usuário não encontrado.', 'USER_NOT_FOUND');
    }

    if (dto.email && dto.email.trim().toLowerCase() !== usuario.email) {
      const existing = await this.usuarioRepository.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new DomainError('E-mail já cadastrado.', 'EMAIL_ALREADY_EXISTS');
      }
    }

    const before = {
      name: usuario.name,
      email: usuario.email,
      role: usuario.role,
      teamId: usuario.teamId,
    };
    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : undefined;

    usuario.update({
      name: dto.name,
      email: dto.email,
      role: dto.role,
      teamId: dto.teamId,
      passwordHash,
    });

    await this.usuarioRepository.save(usuario);
    await this.logService.record(
      actorId,
      'usuario.updated',
      usuario.id,
      before,
      {
        name: usuario.name,
        email: usuario.email,
        role: usuario.role,
        teamId: usuario.teamId,
      },
    );
    return usuario;
  }
}
