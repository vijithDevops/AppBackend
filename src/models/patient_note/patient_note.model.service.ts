import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getStartOfMonthDate } from 'src/common/utils/date_helper';
import { Repository } from 'typeorm';
import { PatientNote } from './entity/patient_note.entity';
import {
  ICreatePatientNote,
  IFindAllPatientNotes,
  IUpdatePatientNote,
} from './interfaces';
import { CalendarModelService } from '../calendar/calendar.model.service';

@Injectable()
export class PatientNoteModelService {
  constructor(
    @InjectRepository(PatientNote)
    private patientNoteRepository: Repository<PatientNote>,
    private calendarModelService: CalendarModelService,
  ) {}

  async create(createPatientNote: ICreatePatientNote): Promise<PatientNote> {
    return await this.patientNoteRepository.save(createPatientNote);
  }

  async update(updatePatientNote: IUpdatePatientNote): Promise<PatientNote> {
    return await this.patientNoteRepository.save(updatePatientNote);
  }

  async updateReadTime(id: string): Promise<PatientNote> {
    return await this.patientNoteRepository
      .save({
        id,
        doctorReadAt: new Date(),
      })
      .catch((err) => {
        throw err;
      });
  }

  async findAllPatientNotesPaginated(
    options: IFindAllPatientNotes,
    patientId?: string,
  ) {
    const query = this.patientNoteRepository.createQueryBuilder('patient_note');
    if (patientId) {
      query
        .where('patient_note.patientId =:patientId')
        .setParameters({ patientId });
    }
    if (options.date) {
      const fromDate = getStartOfMonthDate(new Date(options.date));
      const toDate = new Date(fromDate);
      toDate.setMonth(fromDate.getMonth() + 1);
      query.andWhere(
        'patient_note.createdAt > :fromDate AND patient_note.createdAt < :toDate',
        { fromDate, toDate },
      );
    }
    if (options.day) {
      query.andWhere('patient_note.calendarId =:calendarId', {
        calendarId: (
          await this.calendarModelService.getCalendarDate(new Date(options.day))
        ).id,
      });
    }
    if (options.isDoctorAttn || options.isDoctorAttn === false) {
      query.andWhere('patient_note.isDoctorAttn =:isDoctorAttn', {
        isDoctorAttn: options.isDoctorAttn,
      });
    }
    if (options.sort) {
      query.orderBy('patient_note.createdAt', options.sort);
    }
    const [data, count] = await query
      .offset(options.skip)
      .limit(options.limit)
      .getManyAndCount();
    return { data, totalCount: count };
  }

  async findOne(id: string, patientId?: string): Promise<PatientNote> {
    const query = { id };
    if (patientId) {
      query['patientId'] = patientId;
    }
    return await this.patientNoteRepository.findOne({
      where: query,
      relations: ['patient'],
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.patientNoteRepository.softDelete(id);
  }
}
