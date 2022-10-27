import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { AppointmentType } from '../appointment/entity/appointment.enum';
import { User } from '../user/entity/user.entity';
import { Role } from '../user/entity/user.enum';
import { Calendar } from './entity/calendar.entity';
import {
  IFindUserCalendarAppointmentsBetweenDates,
  IMonthlyCalendarRawData,
  IPatientInputsCalendarRawData,
} from './interfaces';

@Injectable()
export class CalendarModelService {
  constructor(
    @InjectRepository(Calendar)
    private calendarRepository: Repository<Calendar>,
    @InjectConnection() private connection: Connection,
  ) {}

  async getCalendarDate(date: Date): Promise<Calendar> {
    const dateObj = new Date(date);
    const calendar = await this.calendarRepository.findOne({
      day: dateObj.getDate(),
      month: dateObj.getMonth() + 1,
      year: dateObj.getFullYear(),
    });
    if (!calendar) {
      return await this.create(dateObj);
    } else {
      return calendar;
    }
  }

  async create(date: Date): Promise<Calendar> {
    const dateObj = new Date(date);
    return await this.calendarRepository.save({
      date: new Date(
        dateObj.getFullYear(),
        dateObj.getMonth(),
        dateObj.getDate(),
        0,
        0,
        0,
      ),
      day: dateObj.getDate(),
      month: dateObj.getMonth() + 1,
      year: dateObj.getFullYear(),
    });
  }

  async getCalendarDetails(userId: string, role: Role, calendarId: string) {
    const query = this.calendarRepository
      .createQueryBuilder('calendar')
      .andWhere('calendar.id =:calendarId', { calendarId });
    if (role === Role.PATIENT) {
      query
        .leftJoinAndSelect(
          'calendar.patientHealthInputs',
          'patientHealthInputs',
          'patientHealthInputs.patientId = :userId',
        )
        .leftJoinAndSelect(
          'calendar.patientMedicationInputs',
          'patientMedicationInputs',
          'patientMedicationInputs.patientId = :userId',
        )
        .leftJoinAndSelect(
          'patientMedicationInputs.medicationPrescription',
          'medicationPrescription',
        )
        .leftJoinAndSelect(
          'calendar.clinicianNotes',
          'clinicianNotes',
          'clinicianNotes.patientId = :userId',
        )
        .leftJoinAndSelect(
          'calendar.patientNotes',
          'patientNotes',
          'patientNotes.patientId = :userId',
        )
        .leftJoinAndSelect(
          'calendar.patientSymptomsInputs',
          'patientSymptomsInputs',
          'patientSymptomsInputs.patientId = :userId',
        )
        .leftJoinAndSelect(
          'calendar.patientQuestionnaireInput',
          'patientQuestionnaireInput',
          'patientQuestionnaireInput.patientId = :userId',
        )
        .leftJoinAndSelect(
          'patientQuestionnaireInput.patientInputs',
          'patientInputs',
        )
        .leftJoinAndSelect(
          'calendar.patientBreathingInputs',
          'patientBreathinginputs',
          'patientBreathinginputs.patientId = :userId',
        )
        .leftJoinAndSelect(
          'patientBreathinginputs.breatingExercisePrescription',
          'breatingExercisePrescription',
        );
    }

    if (role === Role.DOCTOR) {
      query
        .leftJoinAndSelect(
          'calendar.clinicianNotes',
          'clinicianNotes',
          'clinicianNotes.doctorId = :userId',
        )
        .leftJoinAndSelect(
          'calendar.patientNotes',
          'patientNotes',
          'patientNotes.doctorId = :userId',
        );
    }
    query
      .leftJoinAndSelect(
        'calendar.userAppointments',
        'userAppointments',
        'userAppointments.userId = :userId',
      )
      .setParameters({ userId });
    return await query.getOne();
  }

  async getPatientInputsCountOnCalendarBetweenDatesRawData(
    patientId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<IPatientInputsCalendarRawData[]> {
    return await this.calendarRepository
      .createQueryBuilder('calendar')
      .select([
        'calendar.id AS id',
        'calendar.date AS date',
        'calendar.day AS day',
        'calendar.month AS month',
        'calendar.year AS year',
      ])
      .andWhere(':startDate <= calendar.date AND calendar.date <= :endDate', {
        startDate,
        endDate,
      })
      .leftJoin(
        'calendar.patientMedicationInputs',
        'medicationInputs',
        'medicationInputs.patientId = :userId',
      )
      .addSelect('COUNT(DISTINCT(medicationInputs.id)) AS medication_inputs')
      .leftJoin(
        'calendar.patientBreathingInputs',
        'breathingInputs',
        'breathingInputs.patientId = :userId',
      )
      .addSelect('COUNT(DISTINCT(breathingInputs.id)) AS breathing_inputs')
      .leftJoin(
        'calendar.patientSymptomsInputs',
        'symptomsInputs',
        'symptomsInputs.patientId = :userId',
      )
      .addSelect('COUNT(DISTINCT(symptomsInputs.id)) AS symptoms_inputs')
      .leftJoin(
        'calendar.patientQuestionnaireInput',
        'patientQuestionnaireInput',
        'patientQuestionnaireInput.patientId = :userId',
      )
      .addSelect(
        'COUNT(DISTINCT(patientQuestionnaireInput.id)) AS questionnaire_inputs',
      )
      .leftJoin(
        'calendar.patientHealthInputs',
        'healthInputs',
        'healthInputs.patientId = :userId',
      )
      .addSelect('COUNT(DISTINCT(healthInputs.id)) AS health_inputs')
      .groupBy('calendar.id')
      .orderBy('calendar.date', 'ASC')
      .setParameters({ userId: patientId })
      .getRawMany()
      .catch((err) => {
        throw err;
      });
  }

  async getUserMonthlyCalendarRawData(
    user: User,
    date: Date,
  ): Promise<IMonthlyCalendarRawData[]> {
    const queryMonth = date.getMonth() + 1;
    const queryYear = date.getFullYear();
    const query = this.calendarRepository
      .createQueryBuilder('calendar')
      .where('calendar.month =:month AND calendar.year =:year', {
        month: queryMonth,
        year: queryYear,
      })
      .select([
        'calendar.id AS id',
        'calendar.date AS date',
        'calendar.day AS day',
        'calendar.month AS month',
        'calendar.year AS year',
      ]);
    if (user.role === Role.PATIENT) {
      query
        .leftJoin(
          'calendar.patientMedicationInputs',
          'medicationInputs',
          'medicationInputs.patientId = :userId',
        )
        .addSelect('COUNT(DISTINCT(medicationInputs.id)) AS medication_inputs')
        .leftJoin(
          'calendar.patientSymptomsInputs',
          'symptomsInputs',
          'symptomsInputs.patientId = :userId',
        )
        .addSelect('COUNT(DISTINCT(symptomsInputs.id)) AS symptoms_inputs')
        .leftJoin(
          'calendar.patientQuestionnaireInput',
          'patientQuestionnaireInput',
          'patientQuestionnaireInput.patientId = :userId',
        )
        .addSelect(
          'COUNT(DISTINCT(patientQuestionnaireInput.id)) AS questionnaire_inputs',
        )
        .leftJoin(
          'calendar.patientHealthInputs',
          'patientHealthInputs',
          'patientHealthInputs.patientId = :userId',
        )
        .addSelect('COUNT(DISTINCT(patientHealthInputs.id)) AS health_inputs')
        .leftJoin(
          'calendar.clinicianNotes',
          'clinicianNotes',
          'clinicianNotes.patientId = :userId',
        )
        .addSelect('COUNT(DISTINCT(clinicianNotes.id)) AS clinician_notes')
        .leftJoin(
          'calendar.patientNotes',
          'patientNotes',
          'patientNotes.patientId = :userId',
        )
        .addSelect('COUNT(DISTINCT(patientNotes.id)) AS patient_notes');
    }

    if (user.role === Role.DOCTOR || user.role === Role.NURSE) {
      query
        .leftJoin(
          'calendar.clinicianNotes',
          'clinicianNotes',
          'clinicianNotes.doctorId = :userId',
        )
        .addSelect('COUNT(DISTINCT(clinicianNotes.id)) AS clinician_notes')
        .leftJoin(
          'calendar.patientNotes',
          'patientNotes',
          'patientNotes.doctorId = :userId',
        )
        .addSelect('COUNT(DISTINCT(patientNotes.id)) AS patient_notes');
    }
    query
      .leftJoin(
        'calendar.userAppointments',
        'userFaceToFaceAppointments',
        'userFaceToFaceAppointments.userId = :userId AND userFaceToFaceAppointments.type =:faceToFaceAppointmentType',
        { faceToFaceAppointmentType: AppointmentType.FACE_TO_FACE },
      )
      .addSelect(
        'COUNT(DISTINCT(userFaceToFaceAppointments.id)) AS face_to_face_appointments',
      );
    query
      .leftJoin(
        'calendar.userAppointments',
        'userVideoCallAppointments',
        'userVideoCallAppointments.userId = :userId AND userVideoCallAppointments.type =:videoCallAppointmentType',
        { videoCallAppointmentType: AppointmentType.VIDEO_CALL },
      )
      .addSelect(
        'COUNT(DISTINCT(userVideoCallAppointments.id)) AS video_call_appointments',
      )
      .groupBy('calendar.id')
      .orderBy('calendar.date', 'ASC')
      .setParameters({ userId: user.id });
    return await query.getRawMany();
  }

  async findUserCalendarAppointmentsBetweenDates(
    filter: IFindUserCalendarAppointmentsBetweenDates,
  ) {
    const query = this.calendarRepository
      .createQueryBuilder('calendar')
      .andWhere('calendar.date >= :startDate AND calendar.date <= :endDate', {
        startDate: filter.startDate,
        endDate: filter.endDate,
      })
      .innerJoin(
        'calendar.userAppointments',
        'userAppointments',
        'userAppointments.userId = :userId',
        { userId: filter.userId },
      )
      .addSelect([
        'userAppointments.appointmentId',
        'userAppointments.title',
        'userAppointments.appointmentStatus',
        'userAppointments.startTime',
        'userAppointments.endTime',
        'userAppointments.organizationId',
      ])
      .leftJoin('userAppointments.patient', 'patient')
      .addSelect([
        'patient.id',
        'patient.username',
        'patient.firstName',
        'patient.middleName',
        'patient.lastName',
        'patient.profilePic',
        'patient.profilePicThumbnail',
      ])
      // Uncomment only if doctor details is required in the API
      // .leftJoin('userAppointments.doctor', 'doctor')
      // .addSelect([
      //   'doctor.id',
      //   'doctor.username',
      //   'doctor.firstName',
      //   'doctor.middleName',
      //   'doctor.lastName',
      //   'doctor.profilePic',
      //   'doctor.profilePicThumbnail',
      // ])
      .orderBy('calendar.date', 'ASC')
      .addOrderBy('userAppointments.startTime', 'ASC');
    if (filter.search) {
      query.andWhere(
        "((patient.firstName || ( CASE WHEN patient.middleName IS NULL THEN ' '  ELSE ' ' || patient.middleName || ' ' END ) || patient.lastName ILIKE :searchName) OR (userAppointments.title ILIKE :searchName))",
        {
          searchName: `%${filter.search}%`,
        },
      );
    }
    if (filter.organizationId) {
      query.andWhere('userAppointments.organizationId = :organizationId', {
        organizationId: filter.organizationId,
      });
    }
    if (filter.doctorId) {
      query.andWhere('userAppointments.doctorId = :doctorId', {
        doctorId: filter.doctorId,
      });
    }
    if (filter.patientId) {
      query.andWhere('userAppointments.patientId = :patientId', {
        patientId: filter.patientId,
      });
    }
    if (filter.status) {
      query.andWhere('userAppointments.status = :status', {
        status: filter.status,
      });
    }
    if (filter.type) {
      query.andWhere('userAppointments.type = :type', {
        type: filter.type,
      });
    }
    return await query.getMany().catch((err) => {
      throw err;
    });
  }

  async getCalendarBetweenDates(startDate: Date, endDate: Date) {
    const query = this.calendarRepository
      .createQueryBuilder('calendar')
      .where('calendar.date >= :startDate AND calendar.date <= :endDate', {
        startDate,
        endDate,
      })
      .orderBy('calendar.date', 'ASC');
    return await query.getMany().catch((err) => {
      throw err;
    });
  }

  async getPatientSymptomsBetweenDates(
    patientId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const query = this.calendarRepository
      .createQueryBuilder('calendar')
      .where('calendar.date >= :startDate AND calendar.date <= :endDate', {
        startDate,
        endDate,
      })
      .innerJoinAndSelect(
        'calendar.patientSymptomsInputs',
        'patientSymptomsInputs',
        'patientSymptomsInputs.patientId = :patientId',
        { patientId },
      )
      .orderBy('calendar.date', 'ASC');
    return await query.getMany().catch((err) => {
      throw err;
    });
  }

  async getPatientQuestionnaireInputBetweenDates(
    patientId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const query = this.calendarRepository
      .createQueryBuilder('calendar')
      .where('calendar.date >= :startDate AND calendar.date <= :endDate', {
        startDate,
        endDate,
      })
      .innerJoinAndSelect(
        'calendar.patientQuestionnaireInput',
        'patientQuestionnaireInput',
        'patientQuestionnaireInput.patientId = :patientId',
        { patientId },
      )
      .leftJoinAndSelect(
        'patientQuestionnaireInput.patientInputs',
        'patientInputs',
      )
      .orderBy('calendar.date', 'ASC');
    return await query.getMany().catch((err) => {
      throw err;
    });
  }
}
