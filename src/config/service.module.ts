import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/services/logger/logger.module';
import { CronModule } from '../services/cron/cron.module';

@Module({
  imports: [LoggerModule, CronModule],
})
export class ServiceModule {}
