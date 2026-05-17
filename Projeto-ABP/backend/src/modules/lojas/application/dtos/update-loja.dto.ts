import { z } from 'zod';

export const updateLojaSchema = z.object({
  name: z.string().min(1, 'O nome da loja é obrigatório.').optional(),
  city: z.string().min(1, 'A cidade é obrigatória.').optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export type UpdateLojaDto = z.infer<typeof updateLojaSchema>;
