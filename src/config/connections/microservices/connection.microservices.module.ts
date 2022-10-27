import { Module } from '@nestjs/common';
import { EventSchedulerConnectionModule } from './event-scheduler/connection.microservice.event-scheduler.module';

@Module({
  imports: [EventSchedulerConnectionModule],
})
export class MicroservicesConnectionModule {}
