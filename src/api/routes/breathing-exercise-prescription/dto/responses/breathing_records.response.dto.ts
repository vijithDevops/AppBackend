import { ApiProperty } from '@nestjs/swagger';
import { BreathingExercisePrescriptionResponseDto } from './breathing_exercise_prescription.response.dto';

class BreathingRecord {
  id: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  date: Date;
  day: number;
  month: number;
  year: number;
}

export class BreathingRecordsResponseDto {
  @ApiProperty()
  prescription: BreathingExercisePrescriptionResponseDto;

  @ApiProperty({
    isArray: true,
    type: () => BreathingRecord,
  })
  records: BreathingRecord[];

  @ApiProperty()
  totalCount: number;
}
