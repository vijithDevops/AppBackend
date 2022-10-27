import { Module } from '@nestjs/common';
import { PatientNoteService } from './patient-note.service';
import { PatientNoteController } from './patient-note.controller';
import { PatientNoteModelModule } from '../../../models/patient_note/patient_note.model.module';
import { CalendarModelModule } from '../../../models/calendar/calendar.model.module';
import { PatientSupervisionMappingModelModule } from '../../../models/patient_supervision_mapping/patient_supervision_mapping.model.module';
import { UserModelModule } from 'src/models/user/user.model.module';

@Module({
  imports: [
    PatientNoteModelModule,
    CalendarModelModule,
    PatientSupervisionMappingModelModule,
    UserModelModule,
  ],
  providers: [PatientNoteService],
  controllers: [PatientNoteController],
  exports: [PatientNoteService],
})
export class PatientNoteModule {}
