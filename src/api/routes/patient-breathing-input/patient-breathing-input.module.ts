import { Module } from '@nestjs/common';
import { PatientBreathingInputController } from './patient-breathing-input.controller';
import { PatientBreathingInputService } from './patient-breathing-input.service';
import { CalendarModelModule } from '../../../models/calendar/calendar.model.module';
import { BreatingExercisePrescriptionModelModule } from '../../../models/breathing_exercise_prescription/breathing_exercise_prescription.model.module';
import { PatientBreathingInputModelModule } from '../../../models/patient_breathing_input/patient_breathing_input.model.module';
import { UserModelModule } from 'src/models/user/user.model.module';

@Module({
  imports: [
    CalendarModelModule,
    BreatingExercisePrescriptionModelModule,
    PatientBreathingInputModelModule,
    UserModelModule,
  ],
  controllers: [PatientBreathingInputController],
  providers: [PatientBreathingInputService],
  exports: [PatientBreathingInputService],
})
export class PatientBreathingInputModule {}
