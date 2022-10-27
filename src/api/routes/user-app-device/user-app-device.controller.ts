import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserAppDeviceService } from './user-app-device.service';
import { CreateUserDeviceDto } from './dto';
import { UserAppDeviceModelService } from '../../../models/user_app_device/user_app_device.model.service';

@ApiBearerAuth()
@ApiTags('User-app-device')
@Controller('user-app-device')
export class UserAppDeviceController {
  constructor(
    private readonly userAppDeviceService: UserAppDeviceService,
    private readonly userAppDeviceModelService: UserAppDeviceModelService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async addUserDevice(
    @Request() req,
    @Body() addUserDevice: CreateUserDeviceDto,
  ) {
    let newDeviceAdded = true;
    let deviceUpdated = false;
    const userDevice = await this.userAppDeviceModelService.findOneUserDevice({
      userId: req.user.id,
      deviceType: addUserDevice.deviceType,
    });
    if (userDevice) {
      newDeviceAdded = false;
      if (
        userDevice.appVersion !== addUserDevice.appVersion ||
        userDevice.deviceToken !== addUserDevice.deviceToken
      ) {
        userDevice.appVersion = addUserDevice.appVersion;
        userDevice.deviceToken = addUserDevice.deviceToken;
        await this.userAppDeviceModelService.updateUserDevice(userDevice);
        deviceUpdated = true;
      }
    } else {
      await this.userAppDeviceModelService.addUserDevice({
        userId: req.user.id,
        ...addUserDevice,
      });
    }
    return {
      message: 'User device added successfully',
      newDeviceAdded,
      deviceUpdated,
    };
  }
}
