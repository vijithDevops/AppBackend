import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/utils/dto/paginate.dto';

export class ChatUsersListPaginated extends PaginationDto {
  @ApiProperty({
    description: 'Filter by organization for admin',
    type: String,
    required: false,
  })
  @IsOptional()
  organizationId?: string;

  @ApiProperty({
    description: 'Search user by name',
    required: false,
  })
  @IsOptional()
  search?: string;
}
