import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/utils/dto/paginate.dto';

export class PublicDoctorListPaginated extends PaginationDto {
  @ApiProperty({
    description: 'Filter by organization',
    type: String,
    required: false,
  })
  @IsOptional()
  organizationId?: string;

  @ApiProperty({
    description: 'Search doctor by name',
    required: false,
  })
  @IsOptional()
  search?: string;
}
