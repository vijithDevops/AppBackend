import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  newPassword: string;
}
