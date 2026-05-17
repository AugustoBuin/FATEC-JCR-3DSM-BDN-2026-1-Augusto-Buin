import { z } from 'zod';

export const createTimeSchema = z.object({
  name: z.string().min(1, 'O nome do time é obrigatório.'),
  lojaId: z.string().uuid('O identificador da loja deve ser um UUID v4 válido.'),
});

export type CreateTimeDto = z.infer<typeof createTimeSchema>;
