import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { PatientBreathingInput } from './entity/patient_breathing_input.entity';
import {
  IBreathingRecordsPaginateOptions,
  ICreatePatientBreathingInput,
  IFindPatientBreathingInputsFilter,
} from './interfaces';
import { BreathingRecordsPaginateSQL } from './sql/get_breathing_records.sql';

@Injectable()
export class PatientBreathingInputModelService {
  constructor(
    @InjectRepository(PatientBreathingInput)
    private patientBreathingInputRepository: Repository<PatientBreathingInput>,
    @InjectConnection() private connection: Connection,
  ) {}

  async createMany(
    createPatientBreathingInput: ICreatePatientBreathingInput[],
  ): Promise<PatientBreathingInput[]> {
    return await this.patientBreathingInputRepository.save(
      createPatientBreathingInput,
    );
  }

  async findAllPaginatedAndFilter(
    filterOptions: IFindPatientBreathingInputsFilter,
  ) {
    const query = this.patientBreathingInputRepository
      .createQueryBuilder('input')
      .where('input.patientId =:patientId', {
        patientId: filterOptions.patientId,
      })
      .leftJoinAndSelect(
        'input.breatingExercisePrescription',
        'breatingExercisePrescription',
      )
      .offset(filterOptions.skip)
      .limit(filterOptions.limit)
      .orderBy('input.createdAt', filterOptions.sort);
    if (filterOptions.breathingPrescriptionId) {
      query.andWhere(
        'input.breathingPrescriptionId = :breathingPrescriptionId',
        { breathingPrescriptionId: filterOptions.breathingPrescriptionId },
      );
    }
    const [data, count] = await query.getManyAndCount();
    return { data, totalCount: count };
  }

  async getOneLatestInput(patientId: string) {
    return await this.patientBreathingInputRepository
      .createQueryBuilder('input')
      .leftJoinAndSelect('input.calendar', 'calendar')
      .where('input.patientId =:patientId', { patientId })
      .orderBy('input.createdAt', 'DESC')
      .getOne();
  }

  async getBreathingRecordsPaginated(
    prescriptionId: string,
    options: IBreathingRecordsPaginateOptions,
  ): Promise<{ data: PatientBreathingInput[]; totalCount: number }> {
    try {
      const sqlParams = [prescriptionId];
      const { listQuery, countQuery } = BreathingRecordsPaginateSQL(options);
      const [data, totalCount] = await Promise.all([
        this.connection.query(listQuery, sqlParams),
        this.connection.query(countQuery, sqlParams),
      ]);
      return {
        data,
        totalCount: parseInt(totalCount[0].count),
      };
    } catch (error) {
      throw error;
    }
  }

  async getPatientBreathingInputsByCalendarId(
    patientId: string,
    calendarId: string,
    prescriptionIds?: string[],
  ): Promise<PatientBreathingInput[]> {
    try {
      const query = this.patientBreathingInputRepository
        .createQueryBuilder('input')
        .where('input.patientId =:patientId', { patientId })
        .andWhere('input.calendarId = :calendarId', { calendarId });
      if (prescriptionIds && prescriptionIds.length > 0) {
        query.andWhere(
          'input.breathingPrescriptionId IN (:...prescriptionIds)',
          { prescriptionIds },
        );
      }
      return await query.getMany();
    } catch (error) {
      throw error;
    }
  }
}
