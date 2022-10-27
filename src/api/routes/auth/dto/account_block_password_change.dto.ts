import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AccountBlockPasswordChangeDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  token: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  newPassword: string;
}
