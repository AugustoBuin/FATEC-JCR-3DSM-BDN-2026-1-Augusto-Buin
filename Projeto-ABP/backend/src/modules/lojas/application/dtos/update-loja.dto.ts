import { z } from 'zod';

export const updateLojaSchema = z.object({
  name: z.string().min(1, 'O nome da loja é obrigatório.').optional(),
  city: z.string().min(1, 'A cidade é obrigatória.').optional(),
  address: z.string().optional(),
  phone: z
    .string()
    .regex(
      /^\d{13}$/,
      'Telefone inválido. Use o formato: 55 + DDD + 9 dígitos.',
    )
    .optional(),
});

export type UpdateLojaDto = z.infer<typeof updateLojaSchema>;
