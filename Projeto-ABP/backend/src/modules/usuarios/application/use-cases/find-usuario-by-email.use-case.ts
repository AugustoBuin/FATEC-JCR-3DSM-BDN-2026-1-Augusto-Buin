import { Inject, Injectable } from '@nestjs/common';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY,
} from '../../domain/repositories/usuario-repository.interface';
import { DomainError } from '@/shared/errors/domain-error';

@Injectable()
export class FindUsuarioByEmailUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(email: string): Promise<UsuarioEntity> {
    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario) {
      throw new DomainError('Usuário não encontrado.', 'USER_NOT_FOUND');
    }
    return usuario;
  }
}
