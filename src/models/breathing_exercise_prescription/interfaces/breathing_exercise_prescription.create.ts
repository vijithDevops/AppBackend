import { CreateBreathingExercisePrescriptionDto } from 'src/api/routes/breathing-exercise-prescription/dto';

export class ICreateBreathingExercisePrescription extends CreateBreathingExercisePrescriptionDto {
  calendarId: string;
}
