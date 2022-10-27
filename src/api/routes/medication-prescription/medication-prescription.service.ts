import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MedicationPrescription } from 'src/models/medication_prescription/entity/medication_prescription.entity';
import { MedicationPrescriptionModelService } from 'src/models/medication_prescription/medication_prescription.model.service';

@Injectable()
export class MedicationPrescriptionService {
  constructor(
    private readonly medicationPrescriptionModelService: MedicationPrescriptionModelService,
  ) {}

  async validateAndGetMedicationPrescription(
    prescriptionId: string,
    patientId: string,
  ): Promise<MedicationPrescription> {
    const prescription = await this.medicationPrescriptionModelService.findOne(
      prescriptionId,
      patientId,
    );
    if (!prescription) {
      throw new HttpException(
        'Invalid medication prescription for patient',
        HttpStatus.BAD_REQUEST,
      );
    }
    return prescription;
  }
}
