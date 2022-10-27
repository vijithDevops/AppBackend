import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  password?: string;
}
