import { IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/utils/dto/paginate.dto';

export class OrganizationCareteamList extends PaginationDto {
  @ApiProperty({
    description: 'Filter by organization',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({
    description: 'Search careteam by patient name',
    required: false,
  })
  @IsOptional()
  search?: string;
}
