import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicianNoteModelService } from './clinician_note.model.service';
import { ClinicianNote } from './entity/clinician_note.entity';
import { CalendarModelModule } from '../calendar/calendar.model.module';

@Module({
  imports: [TypeOrmModule.forFeature([ClinicianNote]), CalendarModelModule],
  providers: [ClinicianNoteModelService],
  exports: [ClinicianNoteModelService],
})
export class ClinicianNoteModelModule {}
