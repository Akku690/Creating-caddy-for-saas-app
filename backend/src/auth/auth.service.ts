import { Injectable } from '@nestjs/common';
import { FileStorageService } from '../common/storage.service';
import { JwtService } from '../common/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private storage: FileStorageService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const users = this.storage.readJSON('users');
    const user = users.find(
      (u: any) => u.username === username && u.password === password,
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const token = this.jwtService.generateToken({
      id: user.id,
      username: user.username,
      tenantId: user.tenantId,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      },
    };
  }

  verifyToken(token: string) {
    return this.jwtService.verifyToken(token);
  }
}
