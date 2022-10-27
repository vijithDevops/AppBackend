import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/utils/dto/paginate.dto';

export class PatientSymptomsInputListPaginated extends PaginationDto {
  @ApiProperty({
    description: 'Filter by patientId',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: 'Sort by date ASC | DESC',
    default: 'DESC',
    required: false,
    type: String,
  })
  @IsOptional()
  sort?: 'ASC' | 'DESC' = 'DESC';
}
