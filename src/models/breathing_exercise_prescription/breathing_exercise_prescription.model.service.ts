import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BreatingExercisePrescription } from './entity/breathing_exercise_prescription.entity';
import {
  ICreateBreathingExercisePrescription,
  IFindBreathingExercisePrescriptionFilter,
  IFindBreathingExercisePrescriptionsBetweenDatesFilter,
  IUpdateBreathingExercisePrescription,
} from './interfaces';

@Injectable()
export class BreatingExercisePrescriptionModelService {
  constructor(
    @InjectRepository(BreatingExercisePrescription)
    private breatingExercisePrescriptionRepository: Repository<BreatingExercisePrescription>,
  ) {}

  async create(
    createBreathingExercisePrescription: ICreateBreathingExercisePrescription,
  ) {
    return await this.breatingExercisePrescriptionRepository
      .save(createBreathingExercisePrescription)
      .catch((err) => {
        throw err;
      });
  }

  async findOne(id: string, patientId?: string) {
    const where = {
      id,
    };
    if (patientId) {
      where['patientId'] = patientId;
    }
    return await this.breatingExercisePrescriptionRepository
      .findOne({ where })
      .catch((err) => {
        throw err;
      });
  }

  async getPatientBreathingPrescriptionsBetweenDates(
    filter: IFindBreathingExercisePrescriptionsBetweenDatesFilter,
  ): Promise<BreatingExercisePrescription[]> {
    const query = this.breatingExercisePrescriptionRepository
      .createQueryBuilder('breathingPrescription')
      .where('breathingPrescription.patientId = :patientId', {
        patientId: filter.patientId,
      });
    if (filter.options.startDate) {
      query.andWhere('breathingPrescription.endDate >= :startDate', {
        startDate: filter.options.startDate,
      });
    }
    if (filter.options.endDate) {
      query.andWhere('breathingPrescription.startDate <= :endDate', {
        endDate: filter.options.endDate,
      });
    }
    if (filter.options.startDateSort) {
      query.addOrderBy(
        'breathingPrescription.startDate',
        filter.options.startDateSort,
      );
    }
    return await query.getMany();
  }

  async validateBreathingPrescriptionIdsAndFindMany(
    ids: string[],
  ): Promise<BreatingExercisePrescription[]> {
    const prescriptions = await this.breatingExercisePrescriptionRepository
      .createQueryBuilder('exercisePrescription')
      .where('exercisePrescription.id IN (:...ids)', { ids })
      .getMany();
    ids.forEach((id) => {
      if (!prescriptions.find((prescription) => prescription.id === id)) {
        throw new Error('Invalid Breathing Exercise Prescription Id found');
      }
    });
    return prescriptions;
  }

  async update(
    updateBreathingExercisePrescription: IUpdateBreathingExercisePrescription,
  ) {
    return await this.breatingExercisePrescriptionRepository
      .save(updateBreathingExercisePrescription)
      .catch((err) => {
        throw err;
      });
  }

  async findAllPaginatedAndFilter(
    filterOptions: IFindBreathingExercisePrescriptionFilter,
  ) {
    const query = this.breatingExercisePrescriptionRepository
      .createQueryBuilder('exercisePrescription')
      .leftJoinAndSelect('exercisePrescription.reminders', 'reminders')
      .leftJoinAndSelect('reminders.reminderTimes', 'reminderTimes')
      .where('exercisePrescription.patientId =:patientId', {
        patientId: filterOptions.patientId,
      })
      .offset(filterOptions.skip)
      .limit(filterOptions.limit)
      .orderBy('exercisePrescription.createdAt', filterOptions.sort);
    if (filterOptions.isValid) {
      query.andWhere('exercisePrescription.endDate >= :currentDate', {
        currentDate: new Date(),
      });
    } else if (filterOptions.isValid === false) {
      query.andWhere('exercisePrescription.endDate < :currentDate', {
        currentDate: new Date(),
      });
    }
    const [data, count] = await query.getManyAndCount().catch((err) => {
      throw err;
    });
    return { data, totalCount: count };
  }

  async softDelete(id: string): Promise<void> {
    await this.breatingExercisePrescriptionRepository.softDelete(id);
  }
}
