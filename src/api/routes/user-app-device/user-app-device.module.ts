import { Module } from '@nestjs/common';
import { UserAppDeviceService } from './user-app-device.service';
import { UserAppDeviceController } from './user-app-device.controller';
import { UserAppDeviceModelModule } from '../../../models/user_app_device/user_app_device.model.module';

@Module({
  imports: [UserAppDeviceModelModule],
  controllers: [UserAppDeviceController],
  providers: [UserAppDeviceService],
  exports: [UserAppDeviceService],
})
export class UserAppDeviceModule {}
