import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DomainService } from './domain.service';
import { DomainConnectDto, DomainVerifyDto, DomainResponseDto } from './domain.dto';

@Controller('api/domain')
export class DomainController {
  constructor(private domainService: DomainService) {}

  @Get()
  async getAllDomains(): Promise<DomainResponseDto[]> {
    return this.domainService.getAllDomains();
  }

  @Get('tenant/:tenantId')
  async getDomainsByTenant(
    @Param('tenantId') tenantId: number,
  ): Promise<DomainResponseDto[]> {
    return this.domainService.getDomainsByTenant(tenantId);
  }

  @Get('verification/:domain')
  async getDomainVerification(@Param('domain') domain: string) {
    return this.domainService.getDomainVerification(domain);
  }

  @Post('connect')
  async connectDomain(@Body() dto: DomainConnectDto) {
    return this.domainService.connectDomain(dto);
  }

  @Post('verify')
  async verifyDomain(@Body() body: { tenantId: number; domain: string }) {
    return this.domainService.verifyDomain(body.tenantId, body.domain);
  }
}
