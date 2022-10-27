import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/utils/dto/paginate.dto';
// import { Role } from 'src/models/user/entity/user.enum';

export class getAddUsersListAppointmentPaginated extends PaginationDto {
  @ApiProperty({
    description: 'Filter by appointment for already created appointment',
    type: String,
  })
  @IsOptional()
  appointmentId?: string;

  @ApiProperty({
    description: 'Filter by patient for new appointment',
    type: String,
  })
  @IsOptional()
  patientId?: string;

  // @ApiProperty({
  //   description: 'Filter user by role',
  //   required: false,
  //   enum: [Role.DOCTOR, Role.NURSE, Role.CARETAKER],
  //   isArray: true,
  // })
  // @IsOptional()
  // role?: Role[] = [];

  @ApiProperty({
    description: 'Search user by name',
    required: false,
  })
  @IsOptional()
  search?: string;

  // @ApiProperty({
  //   description:
  //     'Sory by field names first_name || last_name || username || phone_number || role',
  //   required: false,
  // })
  // @IsOptional()
  // field?: 'first_name' | 'last_name' | 'username' | 'phone_number' | 'role';

  // @ApiProperty({
  //   description: 'Sort by name ASC | DESC',
  //   required: false,
  // })
  // @IsOptional()
  // sort?: 'ASC' | 'DESC' = 'DESC';

  @ApiProperty({
    description: 'Filter list by exclude userIds',
    required: false,
    type: [String],
    isArray: true,
  })
  @IsOptional()
  excludeIds?: string[];
}
