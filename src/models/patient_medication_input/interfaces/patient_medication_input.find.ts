export class IFindPatientMedicationInputsFilter {
  skip: number;
  limit: number;
  patientId: string;
  calendarId?: string;
  medicationPrescriptionId?: string;
  sort?: 'ASC' | 'DESC' = 'DESC';
}

export class IMedicationRecordsPaginateOptions {
  skip: number;
  limit: number;
}
