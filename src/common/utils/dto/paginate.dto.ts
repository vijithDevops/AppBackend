import { Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    type: Number,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    type: Number,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  perPage?: number = 10;
}
