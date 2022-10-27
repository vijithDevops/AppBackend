import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataProcessingServerService } from './data-processing-server.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get('DATA_PROCESSING_SERVER_BASE_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DataProcessingServerService],
  exports: [DataProcessingServerService],
})
export class DataProcessingServerModule {}
