import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PatientComplianceCalendarResponseDto } from 'src/api/routes/calendar/dto';

export class DataServerPatientComplianceCalendarResponseDto extends PatientComplianceCalendarResponseDto {
  @ApiProperty()
  @IsNotEmpty()
  onBoardDate: Date;
}
