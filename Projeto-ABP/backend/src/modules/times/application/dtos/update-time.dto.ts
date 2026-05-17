import { z } from 'zod';

export const updateTimeSchema = z.object({
  name: z.string().min(1, 'O nome do time é obrigatório.').optional(),
});

export type UpdateTimeDto = z.infer<typeof updateTimeSchema>;
