import { NotificationService } from 'src/services/notification/notification.service';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ClinicianNoteModelService } from 'src/models/clinician_note/clinician_note.model.service';
import { ClinicianNote } from 'src/models/clinician_note/entity/clinician_note.entity';
import { NOTIFICATION_EVENTS } from 'src/config/master-data-constants';
import { NotificationType } from 'src/models/notification_event_master/entity/notification_event.enum';

@Injectable()
export class ClinicianNoteService {
  constructor(
    private readonly clinicianNoteModelService: ClinicianNoteModelService,
    private readonly notificationService: NotificationService,
  ) {}

  async validateAndGetClinicianNote(
    noteId: string,
    reqUserId?: string,
  ): Promise<ClinicianNote> {
    const note = await this.clinicianNoteModelService.findOne(noteId);
    if (!note) {
      throw new HttpException('Invalid Clinician note', HttpStatus.BAD_REQUEST);
    }
    if (reqUserId) {
      if (note.doctorId !== reqUserId) {
        throw new ForbiddenException();
      }
    }
    return note;
  }

  async sendNotificationToPatient(note: ClinicianNote): Promise<void> {
    const notificationMessage = await this.notificationService.createNotificationMessage(
      {
        ...NOTIFICATION_EVENTS.NOTIFY_CLINICIAN_NOTE_PATIENT,
        notificationType: NotificationType.PUSH,
      },
      {},
    );
    this.notificationService.generateNotification(
      {
        ...notificationMessage,
        actorId: note.doctorId,
        payload: {
          noteId: note.id,
        },
      },
      [note.patientId],
      NOTIFICATION_EVENTS.NOTIFY_CLINICIAN_NOTE_PATIENT,
    );
  }
}
