import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty()
  @IsNotEmpty()
  otp: number;
}
