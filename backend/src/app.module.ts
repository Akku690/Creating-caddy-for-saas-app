import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { DomainModule } from './domain/domain.module';
import { AppController } from './app.controller';

@Module({
  imports: [AuthModule, TenantModule, DomainModule],
  controllers: [AppController],
})
export class AppModule {}
