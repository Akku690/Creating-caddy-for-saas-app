import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FileStorageService } from '../common/storage.service';
import { JwtService } from '../common/jwt.service';

@Module({
  providers: [AuthService, FileStorageService, JwtService],
  controllers: [AuthController],
  exports: [AuthService, JwtService],
})
export class AuthModule {}
