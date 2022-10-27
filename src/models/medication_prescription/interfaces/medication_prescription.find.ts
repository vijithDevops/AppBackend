export class IFindMedicationPrescriptionFilter {
  skip: number;
  limit: number;
  patientId: string;
  search?: string;
  consumeDate?: Date;
  date?: Date;
  isValid?: boolean;
  isActive?: boolean;
  sort?: 'ASC' | 'DESC' = 'DESC';
}

export class IFindMedicationPrescriptionsBetweenDatesFilter {
  patientId: string;
  options?: {
    startDate?: Date;
    endDate?: Date;
    startDateSort?: 'ASC' | 'DESC';
  };
}
