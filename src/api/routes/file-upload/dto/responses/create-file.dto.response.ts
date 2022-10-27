import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFileResponseDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  originalName: string;

  @ApiProperty({
    description: 'original location of file',
  })
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'full url for image thumbnail created',
  })
  @IsOptional()
  thumbnail?: string;

  @ApiProperty()
  @IsOptional()
  mimeType?: string;

  @ApiProperty({
    description: 'Size of file in bytes',
  })
  @IsOptional()
  size?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
