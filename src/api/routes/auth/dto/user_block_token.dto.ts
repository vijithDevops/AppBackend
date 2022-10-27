import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserBlockTokenDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  token: string;
}
