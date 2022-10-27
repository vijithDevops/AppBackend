import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAppDeviceModelService } from './user_app_device.model.service';
import { UserAppDevice } from './entity/user_app_device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAppDevice])],
  providers: [UserAppDeviceModelService],
  exports: [UserAppDeviceModelService],
})
export class UserAppDeviceModelModule {}
