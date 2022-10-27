import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientQuestionnaireInputs } from './entity/patient_questionnaire_inputs.entity';
import { PatientQuestionnaireInputMaster } from './entity/patient_questionnaire_input_master.entity';
import {
  ICreatePatientInput,
  ICreateQuestionnaireInputMaster,
} from './interfaces';

@Injectable()
export class PatientQuestionnaireInputModelService {
  constructor(
    @InjectRepository(PatientQuestionnaireInputMaster)
    private patientQuestionnaireInputMasterRepository: Repository<PatientQuestionnaireInputMaster>,
    @InjectRepository(PatientQuestionnaireInputs)
    private patientQuestionnaireInputsRepository: Repository<PatientQuestionnaireInputs>,
  ) {}

  async createQuestionnaireInputMaster(dto: ICreateQuestionnaireInputMaster) {
    return await this.patientQuestionnaireInputMasterRepository.save(dto);
  }

  async updatePatientInputMaster(
    updateObject: PatientQuestionnaireInputMaster,
  ) {
    return await this.patientQuestionnaireInputMasterRepository.save(
      updateObject,
    );
  }

  async updatePatientInputs(updateObject: PatientQuestionnaireInputs[]) {
    return await this.patientQuestionnaireInputsRepository.save(updateObject);
  }

  async createPatientInputs(dto: ICreatePatientInput[]) {
    return await this.patientQuestionnaireInputsRepository.save(dto);
  }

  async checkPatientInputExistForCalendarDate(
    patientId: string,
    calendarId: string,
  ): Promise<boolean> {
    return !!(await this.patientQuestionnaireInputMasterRepository.count({
      where: {
        patientId,
        calendarId,
      },
    }));
  }

  async getPatientQuestionnaireInputs(
    patientId: string,
    options: { calendarId?: string } = {},
  ): Promise<PatientQuestionnaireInputMaster[]> {
    return await this.patientQuestionnaireInputMasterRepository.find({
      where: {
        patientId,
        ...options,
      },
      relations: ['patientInputs'],
    });
  }

  async getPaientInputsById(
    id: string,
    patientId?: string,
  ): Promise<PatientQuestionnaireInputMaster> {
    const where = { id };
    if (patientId) {
      where['patientId'] = patientId;
    }
    return await this.patientQuestionnaireInputMasterRepository.findOne({
      where: where,
      relations: ['patientInputs'],
    });
  }

  // async findAllPaginatedAndFilter(
  //   filterOptions: IFindPatientSymptomsInputsFilter,
  // ) {
  //   const query = this.patientSymptomsInputRepository
  //     .createQueryBuilder('input')
  //     .where('input.patientId =:patientId', {
  //       patientId: filterOptions.patientId,
  //     })
  //     .select('input.totalScore')
  //     .offset(filterOptions.skip)
  //     .limit(filterOptions.limit)
  //     .orderBy('input.createdAt', filterOptions.sort);
  //   const [data, count] = await query.getManyAndCount();
  //   return { data, totalCount: count };
  // }

  // async getOneLatestInput(patientId: string) {
  //   return await this.patientSymptomsInputRepository
  //     .createQueryBuilder('input')
  //     .leftJoinAndSelect('input.calendar', 'calendar')
  //     .where('input.patientId =:patientId', { patientId })
  //     .orderBy('input.createdAt', 'DESC')
  //     .getOne();
  // }
}
