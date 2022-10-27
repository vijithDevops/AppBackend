import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/utils/dto/paginate.dto';

export class getNonMedicalNotificationDtoPaginated extends PaginationDto {
  @ApiProperty({
    description: 'Search by field Id',
    required: false,
  })
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Sort by created Date ASC | DESC',
    default: 'DESC',
    required: false,
    type: String,
  })
  @IsOptional()
  sort?: 'ASC' | 'DESC' = 'DESC';

  @ApiProperty({
    description: 'Filter by organization for admin',
    type: String,
    required: false,
  })
  @IsOptional()
  organizationId?: string;

  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsOptional()
  notifyClinician?: boolean;

  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsOptional()
  notifyCaregiver?: boolean;

  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsOptional()
  patientAckRequired?: boolean;

  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsOptional()
  caregiverAckRequired?: boolean;
}
