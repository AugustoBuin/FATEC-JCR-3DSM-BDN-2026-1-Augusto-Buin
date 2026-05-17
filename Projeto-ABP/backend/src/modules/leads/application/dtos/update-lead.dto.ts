import { z } from 'zod';
import { LEAD_SOURCES } from '../../domain/value-objects/lead-source.vo';

export const updateLeadSchema = z.object({
  userId: z.string().uuid('userId deve ser um UUID v4 válido.').optional(),
  teamId: z.string().uuid('teamId deve ser um UUID v4 válido.').optional(),
  source: z.enum(LEAD_SOURCES).optional(),
  subject: z.string().trim().min(1, 'Assunto é obrigatório.').optional(),
});

export type UpdateLeadDto = z.infer<typeof updateLeadSchema>;
