import { z } from 'zod';
import { NEGOTIATION_STATUSES } from '@/shared/domain/value-objects/negotiation-status.vo';
import { NEGOTIATION_IMPORTANCES } from '@/shared/domain/value-objects/negotiation-importance.vo';

export const openNegociacaoSchema = z.object({
  leadId: z.string().uuid('leadId deve ser um UUID v4 válido.'),
  status: z.enum(NEGOTIATION_STATUSES),
  importance: z.enum(NEGOTIATION_IMPORTANCES),
});

export type OpenNegociacaoDto = z.infer<typeof openNegociacaoSchema>;
