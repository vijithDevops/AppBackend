import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../../models/user/entity/user.enum';

export class getPatientCareTeam {
  @ApiProperty({
    description: 'Filter user by roles',
    required: false,
    enum: [Role.CARETAKER, Role.DOCTOR, Role.NURSE],
    type: [String],
    isArray: true,
  })
  @IsOptional()
  roles?: [Role.CARETAKER, Role.DOCTOR, Role.NURSE][];

  @ApiProperty({
    description: 'Filter list by exclude userIds',
    required: false,
    type: [String],
    isArray: true,
  })
  @IsOptional()
  excludeIds?: string[];

  @ApiProperty({
    description: 'Search user by name',
    required: false,
  })
  @IsOptional()
  search?: string;
}
