import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceType } from 'src/models/user_app_device/entity/user_app_device.enum';

export class LogoutUserDto {
  @ApiProperty({ enum: [...Object.values(DeviceType)] })
  @IsNotEmpty()
  deviceType: DeviceType;

  @ApiProperty()
  @IsNotEmpty()
  deviceToken: string;
}
