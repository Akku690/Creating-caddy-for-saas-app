import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto.username, dto.password);
  }

  @Post('verify')
  verifyToken(@Body() body: { token: string }) {
    const decoded = this.authService.verifyToken(body.token);
    if (!decoded) {
      return { valid: false };
    }
    return { valid: true, payload: decoded };
  }
}
