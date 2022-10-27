import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RemoteModule } from '../api/api.module';
import { ConfigurationModule } from '../config/configuration.module';
import { ConnectionModule } from '../config/connections/connections.module';
import { ModelsModule } from '../models/models.module';
import { ServiceModule } from 'src/config/service.module';

@Module({
  imports: [
    ConfigurationModule,
    RemoteModule,
    ConnectionModule,
    ServiceModule,
    ModelsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
