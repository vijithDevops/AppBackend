import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientBreathingInputModelService } from './patient_breathing_input.model.service';
import { PatientBreathingInput } from './entity/patient_breathing_input.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientBreathingInput])],
  providers: [PatientBreathingInputModelService],
  exports: [PatientBreathingInputModelService],
})
export class PatientBreathingInputModelModule {}
