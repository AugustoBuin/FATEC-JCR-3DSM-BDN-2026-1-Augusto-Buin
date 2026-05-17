import { z } from 'zod';

export const closeNegociacaoSchema = z.object({
  motivoEncerramento: z
    .string()
    .trim()
    .min(1, 'Motivo de encerramento é obrigatório.'),
});

export type CloseNegociacaoDto = z.infer<typeof closeNegociacaoSchema>;
