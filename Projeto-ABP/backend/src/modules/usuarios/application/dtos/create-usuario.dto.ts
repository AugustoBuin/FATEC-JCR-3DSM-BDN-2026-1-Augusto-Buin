import { z } from 'zod';
import { VALID_ROLES } from '../../domain/value-objects/role.vo';

export const createUsuarioSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres.'),
  role: z.enum(VALID_ROLES),
  teamId: z
    .string()
    .uuid('teamId deve ser um UUID v4 válido.')
    .nullable()
    .optional(),
});

export type CreateUsuarioDto = z.infer<typeof createUsuarioSchema>;
