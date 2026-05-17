import { Controller, Get } from '@nestjs/common';
import { Public } from '@/shared/auth/public.decorator';

@Controller()
export class AppController {
  @Get('health')
  @Public()
  health(): { status: string } {
    return { status: 'ok' };
  }
}
