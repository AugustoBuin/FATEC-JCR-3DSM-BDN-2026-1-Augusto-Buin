import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { DomainError } from '@/shared/errors/domain-error';
import { Public } from '@/shared/auth/public.decorator';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'Senha é obrigatória.'),
});

type LoginDto = z.infer<typeof loginSchema>;

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  @Public()
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() dto: LoginDto) {
    try {
      return await this.loginUseCase.execute(dto);
    } catch (error) {
      if (
        error instanceof DomainError &&
        error.code === 'INVALID_CREDENTIALS'
      ) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }
}
