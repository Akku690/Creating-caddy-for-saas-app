import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantDto, TenantResponseDto } from './tenant.dto';

@Controller('api/tenant')
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Get()
  async getAllTenants(): Promise<TenantResponseDto[]> {
    return this.tenantService.getAllTenants();
  }

  @Get(':id')
  async getTenantById(@Param('id') id: number): Promise<TenantResponseDto> {
    return this.tenantService.getTenantById(id);
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
