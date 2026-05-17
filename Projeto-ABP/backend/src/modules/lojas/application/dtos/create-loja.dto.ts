import { z } from 'zod';

export const createLojaSchema = z.object({
  name: z.string().min(1, 'O nome da loja é obrigatório.'),
  city: z.string().min(1, 'A cidade é obrigatória.'),
  address: z.string().optional(),
  phone: z
    .string()
    .regex(
      /^\d{13}$/,
      'Telefone inválido. Use o formato: 55 + DDD + 9 dígitos.',
    )
    .optional(),
});

export type CreateLojaDto = z.infer<typeof createLojaSchema>;
