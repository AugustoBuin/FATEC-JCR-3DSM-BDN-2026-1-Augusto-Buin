import { z } from 'zod';
import { LEAD_SOURCES } from '../../domain/value-objects/lead-source.vo';

export const createLeadSchema = z.object({
  teamId: z.string().uuid('teamId deve ser um UUID v4 válido.'),
  lojaId: z.string().uuid('lojaId deve ser um UUID v4 válido.'),
  clientId: z.string().uuid('clientId deve ser um UUID v4 válido.'),
  userId: z.string().uuid('userId deve ser um UUID v4 válido.'),
  source: z.enum(LEAD_SOURCES),
  subject: z.string().trim().min(1, 'Assunto é obrigatório.'),
});

export type CreateLeadDto = z.infer<typeof createLeadSchema>;
