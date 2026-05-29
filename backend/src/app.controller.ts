import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    return {
      name: 'PlantGen API',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('/health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
