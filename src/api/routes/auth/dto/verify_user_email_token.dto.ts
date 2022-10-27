import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyUserEmailTokenDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  id: string;
}
