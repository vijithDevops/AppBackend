import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/utils/dto/paginate.dto';

export class AvailableGatewaysListPaginated extends PaginationDto {
  @ApiProperty({
    description: 'Filter by organization for admin',
    type: String,
    required: false,
  })
  @IsOptional()
  organizationId?: string;

  @ApiProperty({
    description: 'Search Gateways by name or MAC id',
    required: false,
  })
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Sort by created date ASC | DESC',
    default: 'DESC',
    required: false,
    type: String,
  })
  @IsOptional()
  sort?: 'ASC' | 'DESC' = 'DESC';
}
