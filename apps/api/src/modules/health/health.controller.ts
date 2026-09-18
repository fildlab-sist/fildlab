import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  /**
   * Mitigación de Cold Starts (Free Tier): Endpoint ultraliviano para ping keep-alive
   */
  @Get()
  checkHealth() {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      system: 'SI_FILDLAB-2026',
      memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    };
  }
}
