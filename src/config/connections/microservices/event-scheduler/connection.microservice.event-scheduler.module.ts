import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EventSchedulerConnection } from './connection.microservice.event-scheduler.provider';

@Module({
  imports: [ConfigModule],
  providers: [EventSchedulerConnection],
  exports: [EventSchedulerConnection],
})
export class EventSchedulerConnectionModule {}
