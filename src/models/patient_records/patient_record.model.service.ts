import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientRecord } from './entity/patient_record.entity';
import { ICreatePatientRecord, IFindPatientRecordsFilter } from './interfaces';

@Injectable()
export class PatientRecordModelService {
  constructor(
    @InjectRepository(PatientRecord)
    private patientRecordRepository: Repository<PatientRecord>,
  ) {}

  async createMany(
    createPatientRecord: ICreatePatientRecord[],
  ): Promise<PatientRecord[]> {
    return await this.patientRecordRepository
      .save(createPatientRecord)
      .catch((err) => {
        throw err;
      });
  }

  async findOne(id: string): Promise<PatientRecord> {
    return await this.patientRecordRepository
      .findOne({ id }, { relations: ['patient'] })
      .catch((err) => {
        throw err;
      });
  }

  async findAllPatientRecordsPaginated(
    patientId: string,
    options: IFindPatientRecordsFilter,
  ) {
    const query = this.patientRecordRepository
      .createQueryBuilder('patient_record')
      .where('patient_record.patientId =:patientId', { patientId })
      .leftJoinAndSelect('patient_record.file', 'file');
    if (options.type) {
      query.andWhere('patient_record.type =:type', { type: options.type });
    }
    query.orderBy('patient_record.createdAt', options.sort);
    const [data, count] = await query
      .offset(options.skip)
      .limit(options.limit)
      .getManyAndCount();
    return { data, totalCount: count };
  }

  async softDelete(id: string): Promise<void> {
    await this.patientRecordRepository.softDelete(id);
  }
}
