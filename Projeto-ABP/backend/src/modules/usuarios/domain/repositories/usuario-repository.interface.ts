import { UsuarioEntity } from '../entities/usuario.entity';

export const USUARIO_REPOSITORY = Symbol('USUARIO_REPOSITORY');

export interface IUsuarioRepository {
  findById(id: string): Promise<UsuarioEntity | null>;
  findByEmail(email: string): Promise<UsuarioEntity | null>;
  findAll(): Promise<UsuarioEntity[]>;
  save(usuario: UsuarioEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
