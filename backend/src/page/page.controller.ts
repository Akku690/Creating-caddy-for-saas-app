import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { PageService } from './page.service';
import { TenantService } from '../tenant/tenant.service';
import { CreatePageDto, UpdatePageDto } from './page.dto';

@Controller('api/page')
export class PageController {
  constructor(
    private pageService: PageService,
    private tenantService: TenantService,
  ) {}

  @Get()
  async getAllPages() {
    return this.pageService.getAllPages();
  }

  @Get('tenant/:tenantId')
  async getPagesByTenant(@Param('tenantId') tenantId: number) {
    return this.pageService.getPagesByTenant(tenantId);
  }

  @Get(':id')
  async getPageById(@Param('id') id: number) {
    return this.pageService.getPageById(id);
  }

  @Post()
  async createPage(@Body() dto: CreatePageDto) {
    const tenant = await this.tenantService.getTenantById(dto.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }
    return this.pageService.createPage(dto, tenant);
  }

  @Put(':id')
  async updatePage(
    @Param('id') id: number,
    @Body() body: { tenantId: number; data: UpdatePageDto },
  ) {
    return this.pageService.updatePage(id, body.tenantId, body.data);
  }

  @Delete(':id')
  async deletePage(
    @Param('id') id: number,
    @Body() body: { tenantId: number },
  ) {
    return this.pageService.deletePage(id, body.tenantId);
  }
}
