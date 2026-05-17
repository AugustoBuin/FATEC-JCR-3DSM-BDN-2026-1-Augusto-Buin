import { z } from 'zod';
import { NEGOTIATION_STATUSES } from '@/shared/domain/value-objects/negotiation-status.vo';
import { NEGOTIATION_IMPORTANCES } from '@/shared/domain/value-objects/negotiation-importance.vo';

export const updateNegociacaoSchema = z.object({
  status: z.enum(NEGOTIATION_STATUSES).optional(),
  importance: z.enum(NEGOTIATION_IMPORTANCES).optional(),
  notes: z.string().nullable().optional(),
});

export type UpdateNegociacaoDto = z.infer<typeof updateNegociacaoSchema>;
