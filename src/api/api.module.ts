import { Module } from '@nestjs/common';
import { IndexRouteModule } from './routes/routes.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [IndexRouteModule, SocketModule],
})
export class RemoteModule {}
