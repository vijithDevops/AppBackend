import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/utils/dto/paginate.dto';
import { Role } from '../../../../models/user/entity/user.enum';

export class UserListPaginated extends PaginationDto {
  @ApiProperty({
    description: 'Filter user by role',
    required: false,
    enum: Role,
    type: [String],
    isArray: true,
  })
  @IsOptional()
  role?: Role[];

  @ApiProperty({
    description: 'Filter list by exclude userIds',
    required: false,
    type: [String],
    isArray: true,
  })
  @IsOptional()
  excludeIds?: string[];

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

  @ApiProperty({
    description: 'filter users with gateway online | offline | registering',
    required: false,
  })
  @IsOptional()
  gatewayFilter?: string;

  @ApiProperty({
    description: 'filter users with senosor online | offline | registering',
    required: false,
  })
  @IsOptional()
  sensorFilter?: string;

  @ApiProperty({
    description: 'filter by watchlist',
    required: false,
  })
  @IsOptional()
  isOnWatchlist?: boolean;

  @ApiProperty({
    description:
      'Sory by field names: firstName || lastName || username || phoneNumber || role || gender || patientMedicalRisk || isOnWatchlist || lastConnectionTime || registering || unregistering || lastSyncTime',
    required: false,
    isArray: true,
    type: [String],
  })
  @IsOptional()
  field?: string[];

  @ApiProperty({
    description: 'Sort by ASC | DESC for the corresponding fileds',
    required: false,
    type: [String],
    isArray: true,
  })
  @IsOptional()
  sort?: 'ASC' | 'DESC'[] = ['DESC'];
  // | 'firstName'
  // | 'lastName'
  // | 'username'
  // | 'phoneNumber'
  // | 'role'
  // | 'gender'
  // | 'patientMedicalRisk';

  // @ApiProperty({
  //   description: 'Sort by name ASC | DESC',
  //   required: false,
  //   type: String,
  // })
  // @IsOptional()
  // sort?: 'ASC' | 'DESC' = 'DESC';
}
