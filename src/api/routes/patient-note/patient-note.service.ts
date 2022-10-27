import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PatientNote } from 'src/models/patient_note/entity/patient_note.entity';
import { PatientNoteModelService } from 'src/models/patient_note/patient_note.model.service';
import { User } from 'src/models/user/entity/user.entity';
import { Role } from 'src/models/user/entity/user.enum';

@Injectable()
export class PatientNoteService {
  constructor(
    private readonly patientNoteModelService: PatientNoteModelService,
  ) {}

  async validatePatientNotesAndCheckReqUserAccess(
    id: string,
    reqUser: User,
  ): Promise<PatientNote> {
    const patientNote = await this.patientNoteModelService.findOne(id);
    if (!patientNote) {
      throw new HttpException('Invalid patient note', HttpStatus.BAD_REQUEST);
    }
    const patientId =
      reqUser.role === Role.PATIENT
        ? reqUser.id
        : reqUser.caretakersPatient.patientId;
    if (patientNote.patientId !== patientId) {
      throw new ForbiddenException();
    }
    return patientNote;
  }
}
