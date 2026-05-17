import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY,
} from '../../domain/repositories/usuario-repository.interface';
import { CreateUsuarioDto } from '../dtos/create-usuario.dto';
import { DomainError } from '@/shared/errors/domain-error';
import { LogService } from '@/modules/logs/application/log.service';

@Injectable()
export class CreateUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly logService: LogService,
  ) {}

  async execute(
    dto: CreateUsuarioDto,
    actorId: string,
  ): Promise<UsuarioEntity> {
    const existing = await this.usuarioRepository.findByEmail(dto.email);
    if (existing) {
      throw new DomainError('E-mail já cadastrado.', 'EMAIL_ALREADY_EXISTS');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const usuario = UsuarioEntity.create({
      name: dto.name,
      email: dto.email,
      role: dto.role,
      passwordHash,
      teamId: dto.teamId ?? null,
    });
    await this.usuarioRepository.save(usuario);
    await this.logService.record(actorId, 'usuario.created', usuario.id, null, {
      name: usuario.name,
      email: usuario.email,
      role: usuario.role,
      teamId: usuario.teamId,
    });
    return usuario;
  }
}
