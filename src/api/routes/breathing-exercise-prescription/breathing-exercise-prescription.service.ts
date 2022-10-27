import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BreatingExercisePrescriptionModelService } from 'src/models/breathing_exercise_prescription/breathing_exercise_prescription.model.service';
import { BreatingExercisePrescription } from '../../../models/breathing_exercise_prescription/entity/breathing_exercise_prescription.entity';

@Injectable()
export class BreathingExercisePrescriptionService {
  constructor(
    private readonly breatingExercisePrescriptionModelService: BreatingExercisePrescriptionModelService,
  ) {}

  async validateAndGetBreathingExercisePrescription(
    prescriptionId: string,
    patientId: string,
  ): Promise<BreatingExercisePrescription> {
    const prescription = await this.breatingExercisePrescriptionModelService.findOne(
      prescriptionId,
      patientId,
    );
    if (!prescription) {
      throw new HttpException(
        'Invalid breathing exercise prescription for patient',
        HttpStatus.BAD_REQUEST,
      );
    }
    return prescription;
  }
}
