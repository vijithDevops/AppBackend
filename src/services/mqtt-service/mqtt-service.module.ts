import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MQTTService } from './mqtt-service.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        headers: {
          'x-api-key': configService.get('MQTT_SERVICE_API_KEY'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MQTTService],
  exports: [MQTTService],
})
export class MQTTServiceModule {}
