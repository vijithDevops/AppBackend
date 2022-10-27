import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MqttServiceGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  canActivate(context: ExecutionContext): boolean {
    const mqttServiceApiKey = this.configService.get('MQTT_SERVICE_API_KEY');
    const { headers } = context.switchToHttp().getRequest();
    return headers['x-api-key'] === mqttServiceApiKey;
  }
}
