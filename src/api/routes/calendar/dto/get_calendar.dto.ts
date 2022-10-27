import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetCalendarDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    type: Date,
    default: new Date(),
    description: 'Get calendar events for the specified date',
  })
  @IsOptional()
  date?: Date = new Date();
}
