import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/utils/dto/paginate.dto';

export class UserAssignedPatientListPaginated extends PaginationDto {
  @ApiProperty({
    description: 'Clinician Id',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Search user by name',
    required: false,
  })
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'filter by watchlist',
    required: false,
  })
  @IsOptional()
  isOnWatchlist?: boolean;

  @ApiProperty({
    description:
      'Sory by field names: firstName || lastName || username || phoneNumber || role || gender || patientMedicalRisk || isOnWatchlist || lastConnectionTime',
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

  // @ApiProperty({
  //   description:
  //     'Sory by field names: username || phoneNumber || gender || upComingAppointmentAt || latestPatientNoteCreatedAt ||',
  //   required: false,
  //   type: String,
  // })
  // @IsOptional()
  // field?:
  //   | 'firstName'
  //   | 'lastName'
  //   | 'username'
  //   | 'phoneNumber'
  //   | 'upComingAppointmentAt'
  //   | 'latestPatientNoteCreatedAt'
  //   | 'gender';

  // @ApiProperty({
  //   description: 'Sort by name ASC | DESC',
  //   required: false,
  //   type: String,
  // })
  // @IsOptional()
  // sort?: 'ASC' | 'DESC' = 'DESC';
}
