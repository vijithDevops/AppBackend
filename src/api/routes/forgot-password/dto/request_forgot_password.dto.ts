import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestForgorPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;
}
