import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getStartOfMonthDate } from 'src/common/utils/date_helper';
import { Repository } from 'typeorm';
import { ClinicianNote } from './entity/clinician_note.entity';
import {
  ICreateClinicianNote,
  IFindAllClinicianNotes,
  IUpdateClinicianNote,
} from './interfaces';
import { CalendarModelService } from '../calendar/calendar.model.service';

@Injectable()
export class ClinicianNoteModelService {
  constructor(
    @InjectRepository(ClinicianNote)
    private clinicianNoteRepository: Repository<ClinicianNote>,
    private calendarModelService: CalendarModelService,
  ) {}
  async create(
    createClinicianNote: ICreateClinicianNote,
  ): Promise<ClinicianNote> {
    return await this.clinicianNoteRepository.save(createClinicianNote);
  }

  async update(
    updateClinicianNote: IUpdateClinicianNote,
  ): Promise<ClinicianNote> {
    return await this.clinicianNoteRepository.save(updateClinicianNote);
  }

  async findAllClinicianNotesPaginated(
    options: IFindAllClinicianNotes,
    patientId: string,
  ) {
    const query = this.clinicianNoteRepository
      .createQueryBuilder('clinician_note')
      .where('clinician_note.patientId = :patientId', {
        patientId: patientId,
      })
      .offset(options.skip)
      .limit(options.limit)
      .orderBy('clinician_note.createdAt', options.sort);
    if (options.date) {
      const fromDate = getStartOfMonthDate(new Date(options.date));
      const toDate = new Date(fromDate);
      toDate.setMonth(fromDate.getMonth() + 1);
      query.andWhere(
        'clinician_note.createdAt > :fromDate AND clinician_note.createdAt < :toDate',
        { fromDate, toDate },
      );
    }
    if (options.day) {
      query.andWhere('clinician_note.calendarId =:calendarId', {
        calendarId: (
          await this.calendarModelService.getCalendarDate(new Date(options.day))
        ).id,
      });
    }
    if (options.isDiagnosis || options.isDiagnosis === false) {
      query.andWhere('clinician_note.isDiagnosis = :isDiagnosis', {
        isDiagnosis: options.isDiagnosis,
      });
    }
    const [data, count] = await query.getManyAndCount();
    return { data, totalCount: count };
  }

  async findOne(id: string): Promise<ClinicianNote> {
    return await this.clinicianNoteRepository.findOne(id);
  }

  async getLatestNoteOfPatient(patientId: string): Promise<ClinicianNote> {
    return await this.clinicianNoteRepository
      .createQueryBuilder('clinician_note')
      .where('clinician_note.patientId = :patientId', {
        patientId: patientId,
      })
      .addOrderBy('clinician_note.createdAt', 'DESC')
      .getOne();
  }

  async softDelete(id: string): Promise<void> {
    await this.clinicianNoteRepository.softDelete(id);
  }

  async updateReadTime(id: string): Promise<ClinicianNote> {
    return await this.clinicianNoteRepository
      .save({
        id,
        patientReadAt: new Date(),
      })
      .catch((err) => {
        throw err;
      });
  }
}
