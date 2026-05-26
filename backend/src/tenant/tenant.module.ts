import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { FileStorageService } from '../common/storage.service';

@Module({
  providers: [TenantService, FileStorageService],
  controllers: [TenantController],
  exports: [TenantService],
})
export class TenantModule {}
