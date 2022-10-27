import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { PatientMedicationInput } from './entity/patient_medication_input.entity';
import {
  ICreatePatientMedicationInput,
  IFindPatientMedicationInputsFilter,
  IMedicationRecordsPaginateOptions,
} from './interfaces';
import { MedicationRecordsPaginateSQL } from './sql/get_medication_records.sql';

@Injectable()
export class PatientMedicationInputModelService {
  constructor(
    @InjectRepository(PatientMedicationInput)
    private patientMedicationInputRepository: Repository<PatientMedicationInput>,
    @InjectConnection() private connection: Connection,
  ) {}

  async createMany(
    createPatientMedicationInput: ICreatePatientMedicationInput[],
  ) {
    return await this.patientMedicationInputRepository.save(
      createPatientMedicationInput,
    );
  }

  async findAllPaginatedAndFilter(
    filterOptions: IFindPatientMedicationInputsFilter,
  ) {
    const query = this.patientMedicationInputRepository
      .createQueryBuilder('input')
      .leftJoinAndSelect(
        'input.medicationPrescription',
        'medicationPrescription',
      )
      .where('input.patientId =:patientId', {
        patientId: filterOptions.patientId,
      })
      .offset(filterOptions.skip)
      .limit(filterOptions.limit)
      .orderBy('input.createdAt', filterOptions.sort);
    if (filterOptions.medicationPrescriptionId) {
      query.andWhere(
        'input.medicationPrescriptionId = :medicationPrescriptionId',
        { medicationPrescriptionId: filterOptions.medicationPrescriptionId },
      );
    }
    if (filterOptions.calendarId) {
      query.andWhere('input.calendarId = :calendarId', {
        calendarId: filterOptions.calendarId,
      });
    }
    const [data, count] = await query.getManyAndCount();
    return { data, totalCount: count };
  }

  async getOneLatestInput(patientId: string) {
    return await this.patientMedicationInputRepository
      .createQueryBuilder('input')
      .leftJoinAndSelect('input.calendar', 'calendar')
      .where('input.patientId =:patientId', { patientId })
      .orderBy('input.createdAt', 'DESC')
      .getOne();
  }

  async getMedicationRecordsPaginated(
    prescriptionId: string,
    options: IMedicationRecordsPaginateOptions,
  ): Promise<{ data: PatientMedicationInput[]; totalCount: number }> {
    try {
      const sqlParams = [prescriptionId];
      const { listQuery, countQuery } = MedicationRecordsPaginateSQL(options);
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

  async getPatientMedicationInputsByCalendarId(
    patientId: string,
    calendarId: string,
    prescriptionIds?: string[],
  ): Promise<PatientMedicationInput[]> {
    try {
      const query = this.patientMedicationInputRepository
        .createQueryBuilder('input')
        .where('input.patientId =:patientId', { patientId })
        .andWhere('input.calendarId = :calendarId', { calendarId });
      if (prescriptionIds && prescriptionIds.length > 0) {
        query.andWhere(
          'input.medicationPrescriptionId IN (:...prescriptionIds)',
          { prescriptionIds },
        );
      }
      return await query.getMany();
    } catch (error) {
      throw error;
    }
  }
}
