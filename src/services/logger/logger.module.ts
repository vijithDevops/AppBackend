import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { LoggerConfigOptions } from './logger.config';
import { LogService } from './logger.service';

@Global()
@Module({
  imports: [WinstonModule.forRoot(LoggerConfigOptions)],
  providers: [LogService],
  exports: [LogService],
})
export class LoggerModule {}
