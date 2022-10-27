import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JWT_ALGORITHM, JWT_EXPIRES_IN } from 'src/config/constants';
import { JWTService } from './jwt-service.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { algorithm: JWT_ALGORITHM, expiresIn: JWT_EXPIRES_IN },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JWTService],
  exports: [JWTService],
})
export class JWTServiceModule {}
