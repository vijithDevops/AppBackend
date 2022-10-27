import { Module } from '@nestjs/common';
import { BreathingExercisePrescriptionService } from './breathing-exercise-prescription.service';
import { BreathingExercisePrescriptionController } from './breathing-exercise-prescription.controller';
import { BreatingExercisePrescriptionModelModule } from '../../../models/breathing_exercise_prescription/breathing_exercise_prescription.model.module';
import { CalendarModelModule } from '../../../models/calendar/calendar.model.module';
import { PatientBreathingInputModelModule } from '../../../models/patient_breathing_input/patient_breathing_input.model.module';
import { UserModelModule } from '../../../models/user/user.model.module';

@Module({
  imports: [
    BreatingExercisePrescriptionModelModule,
    PatientBreathingInputModelModule,
    CalendarModelModule,
    UserModelModule,
  ],
  controllers: [BreathingExercisePrescriptionController],
  providers: [BreathingExercisePrescriptionService],
})
export class BreathingExercisePrescriptionModule {}
