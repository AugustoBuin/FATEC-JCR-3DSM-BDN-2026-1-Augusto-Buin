import { z } from 'zod';
import { VALID_ROLES } from '../../domain/value-objects/role.vo';

export const updateUsuarioSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.').optional(),
  email: z.string().email('E-mail inválido.').optional(),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres.')
    .optional(),
  role: z.enum(VALID_ROLES).optional(),
  teamId: z
    .string()
    .uuid('teamId deve ser um UUID v4 válido.')
    .nullable()
    .optional(),
});

export type UpdateUsuarioDto = z.infer<typeof updateUsuarioSchema>;
