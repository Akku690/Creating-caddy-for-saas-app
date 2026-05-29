import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantDto, TenantResponseDto } from './tenant.dto';

@Controller('api/tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  async getAllTenants(): Promise<TenantResponseDto[]> {
    return this.tenantService.getAllTenants();
  }

  @Get(':id')
  async getTenantById(@Param('id') id: string): Promise<TenantResponseDto> {
    const tenantId = Number.parseInt(id, 10);
    return this.tenantService.getTenantById(tenantId);
  }

  @Post('resolve')
  async resolveTenant(@Body() body: { hostname: string }) {
    return this.tenantService.resolveTenant(body.hostname);
  }

  @Post()
  async createTenant(@Body() dto: TenantDto): Promise<TenantResponseDto> {
    return this.tenantService.createTenant(dto);
  }
}
