import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/utils/dto/paginate.dto';

export class ClinicianNotesListPaginated extends PaginationDto {
  @ApiProperty({
    description: 'Filter by patientId',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: 'Filter by date month',
    required: false,
  })
  @IsOptional()
  date?: string;

  @ApiProperty({
    description: 'Filter by day',
    required: false,
  })
  @IsOptional()
  day?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by isDiagnosis',
  })
  @IsOptional()
  isDiagnosis?: boolean;

  @ApiProperty({
    description: 'Sort by date ASC | DESC',
    default: 'DESC',
    required: false,
    type: String,
  })
  @IsOptional()
  sort?: 'ASC' | 'DESC' = 'DESC';
}
