import { DeviceType } from '../entity/user_app_device.enum';

export class IFindUserDevice {
  userId: string;
  deviceType: DeviceType;
  deviceToken?: string;
}
