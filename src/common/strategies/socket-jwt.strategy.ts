import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserModelService } from '../../models/user/user.model.service';
import { WsException } from '@nestjs/websockets';
import { WEB_SOCKET_QUERY_AUTH_KEY } from 'src/config/constants';

@Injectable()
export class WebSocketJwtStrategy extends PassportStrategy(
  Strategy,
  'socket-jwt',
) {
  constructor(
    private configService: ConfigService,
    private userModelService: UserModelService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter(
        WEB_SOCKET_QUERY_AUTH_KEY,
      ),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.userModelService.findOneByUsername(
      payload.username,
    );
    if (!user) {
      throw new WsException(UnauthorizedException);
    }
    // eslint-disable-next-line
    const { password, ...userData } = user;
    return userData;
  }
}
