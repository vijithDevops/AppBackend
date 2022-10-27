import { IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(8, 128)
  newPassword: string;
}
