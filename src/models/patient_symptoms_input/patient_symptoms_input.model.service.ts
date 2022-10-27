import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientSymptomsInput } from './entity/patient_symptoms_input.entity';
import {
  ICreatePatientSymptomsInput,
  IFindPatientSymptomsInputsFilter,
} from './interfaces';

@Injectable()
export class PatientSymptomsInputModelService {
  constructor(
    @InjectRepository(PatientSymptomsInput)
    private patientSymptomsInputRepository: Repository<PatientSymptomsInput>,
  ) {}

  async create(createPatientSymptomsInput: ICreatePatientSymptomsInput) {
    return await this.patientSymptomsInputRepository.save(
      createPatientSymptomsInput,
    );
  }

  async findByPatientId(
    patientId: string,
    options: { calendarId?: string } = {},
  ): Promise<PatientSymptomsInput[]> {
    return await this.patientSymptomsInputRepository.find({
      where: {
        patientId,
        ...options,
      },
    });
  }

  async findAllPaginatedAndFilter(
    filterOptions: IFindPatientSymptomsInputsFilter,
  ) {
    const query = this.patientSymptomsInputRepository
      .createQueryBuilder('input')
      .where('input.patientId =:patientId', {
        patientId: filterOptions.patientId,
      })
      .select('input.totalScore')
      .offset(filterOptions.skip)
      .limit(filterOptions.limit)
      .orderBy('input.createdAt', filterOptions.sort);
    const [data, count] = await query.getManyAndCount();
    return { data, totalCount: count };
  }

  async getOneLatestInput(patientId: string) {
    return await this.patientSymptomsInputRepository
      .createQueryBuilder('input')
      .leftJoinAndSelect('input.calendar', 'calendar')
      .where('input.patientId =:patientId', { patientId })
      .orderBy('input.createdAt', 'DESC')
      .getOne();
  }
}
