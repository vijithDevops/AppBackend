import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BreatingExercisePrescriptionModelService } from 'src/models/breathing_exercise_prescription/breathing_exercise_prescription.model.service';
import { Calendar } from 'src/models/calendar/entity/calendar.entity';
import { PatientBreathingInputModelService } from 'src/models/patient_breathing_input/patient_breathing_input.model.service';
import { CreatePatientBreathingInputDto } from './dto';

@Injectable()
export class PatientBreathingInputService {
  constructor(
    private readonly breatingExercisePrescriptionModelService: BreatingExercisePrescriptionModelService,
    private readonly patientBreathingInputModelService: PatientBreathingInputModelService,
  ) {}

  async validateAndGetCreateBreathingPrescriptionInputs(
    inputs: CreatePatientBreathingInputDto[],
    patientId: string,
    calendar: Calendar,
  ) {
    if (!(inputs && inputs.length > 0)) {
      throw new HttpException('Inputs cannot be blank', HttpStatus.BAD_REQUEST);
    }
    const ids = inputs.map((input) => {
      return input.breathingPrescriptionId;
    });
    const prescriptions = await this.breatingExercisePrescriptionModelService
      .validateBreathingPrescriptionIdsAndFindMany(ids)
      .catch((err) => {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      });
    prescriptions.forEach((prescription) => {
      if (prescription.patientId !== patientId) {
        throw new HttpException(
          'Request rejected!! Invalid breathing prescription for patient found',
          HttpStatus.FORBIDDEN,
        );
      }
      if (
        !(
          new Date(prescription.startDate) <= new Date(calendar.date) &&
          new Date(calendar.date) <= new Date(prescription.endDate)
        )
      ) {
        throw new HttpException(
          `Input for the prescription could not be added to today's date`,
          HttpStatus.BAD_REQUEST,
        );
      }
    });
    const breathingInputs = await this.patientBreathingInputModelService.getPatientBreathingInputsByCalendarId(
      patientId,
      calendar.id,
      ids,
    );
    const breathingInputsObj = {};
    breathingInputs.forEach((input) => {
      breathingInputsObj[input.breathingPrescriptionId] = input;
    });
    return inputs.map((input) => {
      if (breathingInputsObj[input.breathingPrescriptionId]) {
        return {
          ...breathingInputsObj[input.breathingPrescriptionId],
          ...input,
        };
      } else {
        return {
          ...input,
          patientId: patientId,
          calendarId: calendar.id,
        };
      }
    });
  }
}
