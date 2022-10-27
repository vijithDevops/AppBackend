import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getStartOfMonthDate } from 'src/common/utils/date_helper';
import { Repository } from 'typeorm';
import { MedicationPrescription } from './entity/medication_prescription.entity';
import {
  ICreateMedicationPrescription,
  IFindMedicationPrescriptionsBetweenDatesFilter,
  IFindMedicationPrescriptionFilter,
  IUpdateMedicationPrescription,
} from './interfaces';

@Injectable()
export class MedicationPrescriptionModelService {
  constructor(
    @InjectRepository(MedicationPrescription)
    private medicationPrescriptionRepository: Repository<MedicationPrescription>,
  ) {}
  async create(createMedicationPrescription: ICreateMedicationPrescription) {
    return await this.medicationPrescriptionRepository.save(
      createMedicationPrescription,
    );
  }

  async softDelete(id: string): Promise<void> {
    await this.medicationPrescriptionRepository.softDelete(id);
  }

  async update(updateMedicationPrescription: IUpdateMedicationPrescription) {
    return await this.medicationPrescriptionRepository.save(
      updateMedicationPrescription,
    );
  }

  async findOne(id: string, patientId?: string, isActive?: boolean) {
    const where = {
      id: id,
    };
    if (patientId) {
      where['patientId'] = patientId;
    }
    if (isActive !== undefined) {
      where['isActive'] = isActive;
    }
    return await this.medicationPrescriptionRepository.findOne({
      where,
    });
  }

  async validateMedicationPrescriptionIdsAndFindMany(
    ids: string[],
  ): Promise<MedicationPrescription[]> {
    const prescriptions = await this.medicationPrescriptionRepository
      .createQueryBuilder('medicationPrescription')
      .where('medicationPrescription.id IN (:...ids)', { ids })
      .getMany();
    ids.forEach((id) => {
      if (!prescriptions.find((prescription) => prescription.id === id)) {
        throw new Error('Invalid Medication Prescription Id found');
      }
    });
    return prescriptions;
  }

  async getPatientMedicationPrescriptionsBetweenDates(
    filter: IFindMedicationPrescriptionsBetweenDatesFilter,
  ): Promise<MedicationPrescription[]> {
    const query = await this.medicationPrescriptionRepository
      .createQueryBuilder('medicationPrescription')
      .where('medicationPrescription.patientId = :patientId', {
        patientId: filter.patientId,
      });
    if (filter.options.startDate) {
      query.andWhere('medicationPrescription.endDate >= :startDate', {
        startDate: filter.options.startDate,
      });
    }
    if (filter.options.endDate) {
      query.andWhere('medicationPrescription.startDate <= :endDate', {
        endDate: filter.options.endDate,
      });
    }
    if (filter.options.startDateSort) {
      query.addOrderBy(
        'medicationPrescription.startDate',
        filter.options.startDateSort,
      );
    }
    return await query.getMany();
  }

  async findAllPaginatedAndFilter(
    filterOptions: IFindMedicationPrescriptionFilter,
  ) {
    const query = this.medicationPrescriptionRepository
      .createQueryBuilder('prescription')
      .leftJoinAndSelect('prescription.reminders', 'reminders')
      .leftJoinAndSelect('reminders.reminderTimes', 'reminderTimes')
      .where('prescription.patientId =:patientId', {
        patientId: filterOptions.patientId,
      })
      .offset(filterOptions.skip)
      .limit(filterOptions.limit)
      .orderBy('prescription.createdAt', filterOptions.sort);
    if (filterOptions.search) {
      query.andWhere('prescription.name ILIKE :name', {
        name: `%${filterOptions.search}%`,
      });
    }
    if (filterOptions.consumeDate) {
      query.andWhere(
        '((prescription.startDate <= :consumeDate AND :consumeDate <= prescription.endDate) OR (prescription.startDate IS null AND :consumeDate <= prescription.endDate) OR (prescription.startDate <= :consumeDate AND prescription.endDate IS null) OR (prescription.startDate IS null AND prescription.endDate IS null))',
        { consumeDate: filterOptions.consumeDate },
      );
    }
    if (filterOptions.date) {
      const fromDate = getStartOfMonthDate(new Date(filterOptions.date));
      const toDate = new Date(fromDate);
      toDate.setMonth(fromDate.getMonth() + 1);
      query.andWhere(
        '((prescription.startDate < :toDate AND :fromDate <= prescription.endDate) OR (prescription.startDate IS null AND :fromDate <= prescription.endDate) OR (prescription.startDate < :toDate AND prescription.endDate IS null) OR (prescription.startDate IS null AND prescription.endDate IS null))',
        { fromDate, toDate },
      );
    }
    if (filterOptions.isValid) {
      query.andWhere(
        '((prescription.endDate >= :currentDate) OR (prescription.endDate IS null))',
        {
          currentDate: new Date(),
        },
      );
    } else if (filterOptions.isValid === false) {
      query.andWhere('(prescription.endDate < :currentDate) OR ()', {
        currentDate: new Date(),
      });
    }
    if (filterOptions.isActive !== null) {
      query.andWhere('prescription.isActive =:isActive', {
        isActive: filterOptions.isActive,
      });
    }
    const [data, count] = await query.getManyAndCount();
    return { data, totalCount: count };
  }
}
