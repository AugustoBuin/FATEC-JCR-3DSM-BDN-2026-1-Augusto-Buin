import { Inject, Injectable } from '@nestjs/common';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY,
} from '../../domain/repositories/usuario-repository.interface';

@Injectable()
export class ListUsuariosUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(): Promise<UsuarioEntity[]> {
    return this.usuarioRepository.findAll();
  }
}
