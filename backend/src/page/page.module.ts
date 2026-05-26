import { Module } from '@nestjs/common';
import { PageService } from './page.service';
import { PageController } from './page.controller';
import { FileStorageService } from '../common/storage.service';
import { TenantService } from '../tenant/tenant.service';

@Module({
  providers: [PageService, FileStorageService, TenantService],
  controllers: [PageController],
  exports: [PageService],
})
export class PageModule {}
