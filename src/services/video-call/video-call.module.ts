import { Module } from '@nestjs/common';
import { VideoCallService } from './video-call.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [VideoCallService],
  exports: [VideoCallService],
})
export class VideoCallModule {}
