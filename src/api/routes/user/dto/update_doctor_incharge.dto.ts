import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateDoctorInchargeDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  supervisorMappingId: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  patientId: string;

  // @ApiProperty({
  //   description: 'is incharge true/false',
  //   required: true,
  //   default: true,
  // })
  // @IsNotEmpty()
  // isIncharge: boolean;
}
