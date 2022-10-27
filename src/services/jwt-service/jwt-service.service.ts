import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { REFRESH_JWT_EXPIRES_IN } from 'src/config/constants';
import { LogService } from '../logger/logger.service';
import { IJwtRefreshTokenPayload, IJwtTokenPayload } from './interfaces';

@Injectable()
export class JWTService {
  constructor(
    private jwtService: JwtService,
    private logService: LogService,
    private configService: ConfigService,
  ) {}

  signToken(payload: IJwtTokenPayload) {
    return this.jwtService.sign(payload);
  }

  signRefreshToken(payload: IJwtRefreshTokenPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESH_JWT_SECRET'),
      expiresIn: REFRESH_JWT_EXPIRES_IN,
    });
  }

  verifyBearerToken(bearerToken: string) {
    return this.jwtService.verify(
      bearerToken,
      this.configService.get('JWT_SECRET'),
    );
  }

  verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.configService.get('REFRESH_JWT_SECRET'),
    });
  }
}
