import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { User } from 'src/models/user/entity/user.entity';
import { LogService } from 'src/services/logger/logger.service';
import { AuthService } from '../routes/auth/auth.service';
import { UserModelService } from '../../models/user/user.model.service';

@Injectable()
export class AppSocketService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private logService: LogService,
    private userModelService: UserModelService,
  ) {}

  async verifyUserAuth(authToken: string): Promise<User> {
    const decoded = await this.authService.verifyJwtToken(authToken);
    if (!decoded) {
      throw new WsException('Unauthorized: Invalid token');
    }
    const user = await this.userModelService.findOneByUsername(
      decoded.username,
    );
    if (!user) {
      throw new WsException('Unauthorized: Invalid user in auth token');
    }
    return user;
  }
}
