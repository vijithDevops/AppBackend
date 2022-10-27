import { UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WebSocketJwtAuthGuard } from 'src/common/guards/socket-jwt-auth.guard';
import { WEB_SOCKET_QUERY_AUTH_KEY } from 'src/config/constants';
import { User } from 'src/models/user/entity/user.entity';
import { LogService } from 'src/services/logger/logger.service';
import {
  CLIENT_SOCKET_EVENTS,
  SERVER_SOCKET_EVENTS,
} from './constants/socket_events';
import { AppSocketService } from './socket.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class AppSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private logService: LogService,
    private appSocketService: AppSocketService,
  ) {}

  @WebSocketServer() public server: Server;
  wsClientSockets = {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server) {
    console.log('Socket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const authToken = client.handshake.query[WEB_SOCKET_QUERY_AUTH_KEY];
      if (!authToken) {
        throw new WsException('Unauthorized: missing authentication query');
      }
      const user = await this.appSocketService.verifyUserAuth(
        Array.isArray(authToken) ? authToken[0] : authToken,
      );
      await this.addOnlineClient(user, client);
      this.logService.logInfo(`Client connected: ${client.id}`, {
        handshake: client.handshake,
      });
      client.emit(CLIENT_SOCKET_EVENTS.AUTHORIZED, { user, connected: true });
    } catch (error) {
      client.emit(CLIENT_SOCKET_EVENTS.ERROR, { error, connected: false });
      client.disconnect(true);
      this.logService.logError(
        `Socket connection failed for client: ${client.id}`,
        {
          client: { client_id: client.id, handshake: client.handshake },
          error,
        },
      );
      //Throw and handle Exceptions if required
    }
  }

  async handleDisconnect(client: Socket) {
    const clientDeleted = await this.deleteOnlineClient(client);
    if (clientDeleted) {
      this.logService.logInfo(`Client disconnected: ${client.id}`);
    } else {
      this.logService.logInfo(
        `Disconnecting unsaved Client Socket: ${client.id}`,
      );
    }
  }

  private addOnlineClient(user: User, client: Socket) {
    this.wsClientSockets[client.id] = {
      userId: user.id,
      client: client,
    };
  }

  private deleteOnlineClient(client: Socket): boolean {
    let clienttDeleted = false;
    if (this.wsClientSockets[client.id]) {
      delete this.wsClientSockets[client.id];
      clienttDeleted = true;
    }
    return clienttDeleted;
  }

  @UseGuards(WebSocketJwtAuthGuard)
  @SubscribeMessage(SERVER_SOCKET_EVENTS.PING)
  handleMessage(client: Socket, payload: string): void {
    this.logService.logInfo(
      `"${SERVER_SOCKET_EVENTS.PING}" event from client: ${client.id}`,
    );
    client.emit(CLIENT_SOCKET_EVENTS.PONG, payload);
  }
}
