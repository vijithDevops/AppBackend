import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/utils/dto/paginate.dto';

export class PublicOrganizationListPaginated extends PaginationDto {
  @ApiProperty({
    description: 'Search organization by name',
    required: false,
  })
  @IsOptional()
  search?: string;
}
