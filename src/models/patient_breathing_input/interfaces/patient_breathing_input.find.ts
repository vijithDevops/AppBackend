export class IFindPatientBreathingInputsFilter {
  skip: number;
  limit: number;
  patientId: string;
  breathingPrescriptionId?: string;
  sort?: 'ASC' | 'DESC' = 'DESC';
}

export class IBreathingRecordsPaginateOptions {
  skip: number;
  limit: number;
}
