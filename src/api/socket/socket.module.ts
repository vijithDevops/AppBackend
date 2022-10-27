import { forwardRef, Global, Module } from '@nestjs/common';
import { UserModelModule } from 'src/models/user/user.model.module';
import { AppSocketGateway } from './socket.gateway';
import { AuthModule } from '../routes/auth/auth.module';
import { WebSocketJwtStrategy } from 'src/common/strategies/socket-jwt.strategy';
import { AppSocketService } from './socket.service';

@Global()
@Module({
  imports: [forwardRef(() => AuthModule), UserModelModule],
  providers: [AppSocketGateway, AppSocketService, WebSocketJwtStrategy],
  exports: [AppSocketGateway],
})
export class SocketModule {}
