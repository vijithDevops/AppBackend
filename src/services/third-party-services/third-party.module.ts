import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThirdPartyService } from './third-party.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({}),
    }),
    ConfigModule,
  ],
  providers: [ThirdPartyService],
  exports: [ThirdPartyService],
})
export class ThirdPartyModule {}
