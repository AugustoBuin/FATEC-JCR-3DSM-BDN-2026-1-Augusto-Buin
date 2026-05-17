import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown): unknown {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const messages = result.error.issues
        .map((issue: { message: string }) => issue.message)
        .join('; ');
      throw new BadRequestException(messages);
    }
    return result.data;
  }
}
