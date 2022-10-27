import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { EVENT_SCHEDULER_SERVICE } from '../../../constants';

export const EventSchedulerConnection = {
  provide: EVENT_SCHEDULER_SERVICE,
  useFactory: async (configService: ConfigService) => {
    return ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('EVENT_SCHEDULER_SERVICE_HOST'),
        port: configService.get('EVENT_SCHEDULER_SERVICE_PORT'),
      },
    });
  },
  inject: [ConfigService],
};
