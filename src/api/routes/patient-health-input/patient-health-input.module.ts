import { Module } from '@nestjs/common';
import { PatientHealthInputService } from './patient-health-input.service';
import { PatientHealthInputController } from './patient-health-input.controller';
import { CalendarModelModule } from '../../../models/calendar/calendar.model.module';
import { PatientHealthInputModelModule } from '../../../models/patient_health_inputs/patient_health_inputs.model.module';
import { UserModelModule } from 'src/models/user/user.model.module';

@Module({
  imports: [
    PatientHealthInputModelModule,
    CalendarModelModule,
    UserModelModule,
  ],
  controllers: [PatientHealthInputController],
  providers: [PatientHealthInputService],
  exports: [PatientHealthInputService],
})
export class PatientHealthInputModule {}
