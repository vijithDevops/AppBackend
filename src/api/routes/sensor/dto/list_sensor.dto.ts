import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/utils/dto/paginate.dto';

export class SensorsListPaginated extends PaginationDto {
  @ApiProperty({
    description: 'Filter by organization for admin',
    type: String,
    required: false,
  })
  @IsOptional()
  organizationId?: string;

  @ApiProperty({
    required: false,
    description:
      'Optional for Admins, Nurses, Doctors. Mandatory for Patients and Caretakers',
  })
  @IsOptional()
  patientId?: string;

  @ApiProperty({
    description: 'Search Sensor by name or MAC id',
    required: false,
  })
  @IsOptional()
  search?: string;

  @ApiProperty({
    description:
      'Sory by field createdAt | lastConnectionTime | name | macId : Default sort field is createdAt',
    required: false,
    type: [String],
    isArray: true,
  })
  @IsOptional()
  field?: string[] = ['createdAt'];

  @ApiProperty({
    description: 'Sort by ASC | DESC for the corresponding fileds',
    required: false,
    type: [String],
    isArray: true,
  })
  @IsOptional()
  sort?: 'ASC' | 'DESC'[] = ['DESC'];

  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsOptional()
  isActive?: boolean;
}
