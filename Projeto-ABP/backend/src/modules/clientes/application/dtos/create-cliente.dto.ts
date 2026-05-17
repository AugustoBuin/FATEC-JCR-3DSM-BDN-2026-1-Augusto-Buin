import { z } from 'zod';

export const createClienteSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  phone: z
    .string()
    .regex(
      /^\d{13}$/,
      'Telefone inválido. Use o formato: 55 + DDD + 9 dígitos.',
    )
    .refine(
      (v) => v.startsWith('55'),
      'Telefone inválido. Use o formato: 55 + DDD + 9 dígitos.',
    ),
  email: z.string().email('E-mail inválido.'),
  cpf: z
    .string()
    .regex(/^\d{11}$/, 'CPF inválido. Deve conter exatamente 11 dígitos.')
    .optional(),
  address: z.string().optional(),
});

export type CreateClienteDto = z.infer<typeof createClienteSchema>;
