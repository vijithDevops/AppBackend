import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatService } from './chat.service';
import {
  CONNECTY_CUBE_HTTP_MAX_REDIRECTS,
  CONNECTY_CUBE_HTTP_TIMEOUT,
} from '../../config/constants';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: CONNECTY_CUBE_HTTP_TIMEOUT,
        maxRedirects: CONNECTY_CUBE_HTTP_MAX_REDIRECTS,
      }),
    }),
    ConfigModule,
  ],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
