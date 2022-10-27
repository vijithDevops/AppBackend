import { DeviceType } from '../entity/user_app_device.enum';

export class ICreateUserAppDevice {
  userId: string;
  deviceToken: string;
  deviceType: DeviceType;
  appVersion: string;
}
