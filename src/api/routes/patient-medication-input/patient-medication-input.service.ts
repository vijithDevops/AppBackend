import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePatientMedicationInputDto } from './dto';
import { MedicationPrescriptionModelService } from '../../../models/medication_prescription/medication_prescription.model.service';
import { Calendar } from 'src/models/calendar/entity/calendar.entity';
import { PatientMedicationInputModelService } from '../../../models/patient_medication_input/patient_medication_input.model.service';
import { checkDateOccursInBetweenDates } from 'src/common/utils/date_helper';

@Injectable()
export class PatientMedicationInputService {
  constructor(
    private readonly medicationPrescriptionModelService: MedicationPrescriptionModelService,
    private readonly patientMedicationInputModelService: PatientMedicationInputModelService,
  ) {}

  async validateAndGetCreateMedicationPrescriptionInputs(
    inputs: CreatePatientMedicationInputDto[],
    patientId: string,
    calendar: Calendar,
  ) {
    if (!(inputs && inputs.length > 0)) {
      throw new HttpException('Inputs cannot be blank', HttpStatus.BAD_REQUEST);
    }
    const ids = inputs.map((input) => {
      return input.medicationPrescriptionId;
    });
    const prescriptions = await this.medicationPrescriptionModelService
      .validateMedicationPrescriptionIdsAndFindMany(ids)
      .catch((err) => {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      });
    prescriptions.forEach((prescription) => {
      if (prescription.patientId !== patientId) {
        throw new HttpException(
          'Request rejected!! Invalid Medication prescription for patient found',
          HttpStatus.FORBIDDEN,
        );
      }
      if (
        !(
          checkDateOccursInBetweenDates(
            [
              {
                startDate: prescription.startDate
                  ? new Date(prescription.startDate)
                  : null,
                endDate: prescription.endDate
                  ? new Date(prescription.endDate)
                  : null,
              },
            ],
            new Date(calendar.date),
          )
          // new Date(prescription.startDate) <= new Date(calendar.date) &&
          // new Date(calendar.date) <= new Date(prescription.endDate)
        )
      ) {
        throw new HttpException(
          `Input for the prescription could not be added to today's date`,
          HttpStatus.BAD_REQUEST,
        );
      }
    });
    const medicationInputs = await this.patientMedicationInputModelService.getPatientMedicationInputsByCalendarId(
      patientId,
      calendar.id,
      ids,
    );
    const medicationInputsObj = {};
    medicationInputs.forEach((input) => {
      medicationInputsObj[input.medicationPrescriptionId] = input;
    });
    return inputs.map((input) => {
      if (medicationInputsObj[input.medicationPrescriptionId]) {
        return {
          ...medicationInputsObj[input.medicationPrescriptionId],
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
