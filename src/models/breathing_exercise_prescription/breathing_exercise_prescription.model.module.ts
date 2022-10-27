import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BreatingExercisePrescriptionModelService } from './breathing_exercise_prescription.model.service';
import { BreatingExercisePrescription } from './entity/breathing_exercise_prescription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BreatingExercisePrescription])],
  providers: [BreatingExercisePrescriptionModelService],
  exports: [BreatingExercisePrescriptionModelService],
})
export class BreatingExercisePrescriptionModelModule {}
