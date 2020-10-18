import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {

  @Get(['', 'live', 'ready'])
  healthCheck(): string {
    return 'ok';
  }
}
