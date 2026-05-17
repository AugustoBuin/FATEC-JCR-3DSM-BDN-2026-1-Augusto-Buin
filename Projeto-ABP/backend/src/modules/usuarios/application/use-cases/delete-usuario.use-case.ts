import { Inject, Injectable } from '@nestjs/common';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY,
} from '../../domain/repositories/usuario-repository.interface';
import { DomainError } from '@/shared/errors/domain-error';
import { LogService } from '@/modules/logs/application/log.service';

@Injectable()
export class DeleteUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly logService: LogService,
  ) {}

  async execute(id: string, actorId: string): Promise<void> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new DomainError('Usuário não encontrado.', 'USER_NOT_FOUND');
    }
    const snapshot = {
      name: usuario.name,
      email: usuario.email,
      role: usuario.role,
      teamId: usuario.teamId,
    };
    await this.usuarioRepository.delete(id);
    await this.logService.record(
      actorId,
      'usuario.deleted',
      id,
      snapshot,
      null,
    );
  }
}
