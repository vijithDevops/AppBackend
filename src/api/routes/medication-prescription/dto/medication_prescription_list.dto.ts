import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/utils/dto/paginate.dto';

export class MedicationPrescriptionListPaginated extends PaginationDto {
  @ApiProperty({
    description: 'Filter by patientId',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: 'Filter by active prescription',
    required: false,
    type: Boolean,
  })
  @IsOptional()
  isActive?: string;

  @ApiProperty({
    type: Date,
    description: 'Get Prescriptions to be consumed on date',
  })
  @IsOptional()
  consumeDate?: Date;

  @ApiProperty({
    description: 'Filter by month',
    required: false,
  })
  @IsOptional()
  date?: Date;

  @ApiProperty({
    description: 'Search by medication name',
    required: false,
  })
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Filter by valid prescriptions(Not expired)',
    required: false,
    type: Boolean,
  })
  @IsOptional()
  isValid?: string;

  @ApiProperty({
    description: 'Sort by date ASC | DESC',
    default: 'DESC',
    required: false,
    type: String,
  })
  @IsOptional()
  sort?: 'ASC' | 'DESC' = 'DESC';
}
