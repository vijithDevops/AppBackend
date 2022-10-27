import { Module } from '@nestjs/common';
import { ClinicianNoteController } from './clinician-note.controller';
import { ClinicianNoteService } from './clinician-note.service';
import { ClinicianNoteModelModule } from '../../../models/clinician_note/clinician_note.model.module';
import { UserModelModule } from '../../../models/user/user.model.module';
import { CalendarModelModule } from '../../../models/calendar/calendar.model.module';
import { NotificationServiceModule } from 'src/services/notification/notification.module';
@Module({
  imports: [
    ClinicianNoteModelModule,
    UserModelModule,
    CalendarModelModule,
    NotificationServiceModule,
  ],
  controllers: [ClinicianNoteController],
  providers: [ClinicianNoteService],
})
export class ClinicianNoteModule {}
