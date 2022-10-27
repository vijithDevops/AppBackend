import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientNoteModelService } from './patient_note.model.service';
import { PatientNote } from './entity/patient_note.entity';
import { CalendarModelModule } from '../calendar/calendar.model.module';

@Module({
  imports: [TypeOrmModule.forFeature([PatientNote]), CalendarModelModule],
  providers: [PatientNoteModelService],
  exports: [PatientNoteModelService],
})
export class PatientNoteModelModule {}
