import { IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/utils/dto/paginate.dto';

export class PatientNotesListPaginated extends PaginationDto {
  @ApiProperty({
    description: 'Filter by patientId',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    required: false,
    description: 'Filter by isDoctorAttn',
  })
  @IsOptional()
  isDoctorAttn?: boolean;

  @ApiProperty({
    description: 'Filter by date month',
    required: false,
  })
  @IsOptional()
  date?: string;

  @ApiProperty({
    description: 'Filter by day date',
    required: false,
  })
  @IsOptional()
  day?: string;

  @ApiProperty({
    description: 'Sort by date ASC | DESC',
    default: 'DESC',
    required: false,
    type: String,
  })
  @IsOptional()
  sort?: 'ASC' | 'DESC' = 'DESC';
}
