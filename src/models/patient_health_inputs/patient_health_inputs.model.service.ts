import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientHealthInputs } from './entity/patient_health_inputs.entity';
import {
  ICreatePatientHealthInput,
  IFindPatientHealthInputsFilter,
} from './interfaces';

@Injectable()
export class PatientHealthInputModelService {
  constructor(
    @InjectRepository(PatientHealthInputs)
    private PatientHealthInputRepository: Repository<PatientHealthInputs>,
  ) {}

  async create(createPatientHealthInput: ICreatePatientHealthInput) {
    return await this.PatientHealthInputRepository.save(
      createPatientHealthInput,
    );
  }

  async update(updateDto: PatientHealthInputs) {
    return await this.PatientHealthInputRepository.save(updateDto);
  }

  async findByPatientId(
    patientId: string,
    options: { calendarId?: string } = {},
  ): Promise<PatientHealthInputs[]> {
    return await this.PatientHealthInputRepository.find({
      where: {
        patientId,
        ...options,
      },
    });
  }

  async findOneById(id: string): Promise<PatientHealthInputs> {
    return await this.PatientHealthInputRepository.findOne(id);
  }

  async findAllPaginatedAndFilter(
    filterOptions: IFindPatientHealthInputsFilter,
  ) {
    const query = this.PatientHealthInputRepository.createQueryBuilder('input')
      .where('input.patientId =:patientId', {
        patientId: filterOptions.patientId,
      })
      .offset(filterOptions.skip)
      .limit(filterOptions.limit)
      .orderBy('input.createdAt', filterOptions.sort);
    const [data, count] = await query.getManyAndCount();
    return { data, totalCount: count };
  }

  async getOneLatestInput(patientId: string) {
    return await this.PatientHealthInputRepository.createQueryBuilder('input')
      .leftJoinAndSelect('input.calendar', 'calendar')
      .where('input.patientId =:patientId', { patientId })
      .orderBy('input.createdAt', 'DESC')
      .getOne();
  }
}
