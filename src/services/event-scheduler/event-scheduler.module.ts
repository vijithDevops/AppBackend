import { Module } from '@nestjs/common';
import { EventSchedulerService } from './event-scheduler.service';
import { EventSchedulerConnectionModule } from '../../config/connections/microservices/event-scheduler/connection.microservice.event-scheduler.module';

@Module({
  imports: [EventSchedulerConnectionModule],
  providers: [EventSchedulerService],
  exports: [EventSchedulerService],
})
export class EventSchedulerModule {}
