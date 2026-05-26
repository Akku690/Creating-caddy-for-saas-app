import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private secret = process.env.JWT_SECRET || 'your-super-secret-key';

  generateToken(payload: any) {
    return jwt.sign(payload, this.secret, { expiresIn: '7d' });
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      return null;
    }
  }
}
