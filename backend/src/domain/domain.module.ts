import { Module } from '@nestjs/common';
import { DomainService } from './domain.service';
import { DomainController } from './domain.controller';
import { FileStorageService } from '../common/storage.service';

@Module({
  providers: [DomainService, FileStorageService],
  controllers: [DomainController],
})
export class DomainModule {}
