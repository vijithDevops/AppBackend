export class IFindBreathingExercisePrescriptionFilter {
  skip: number;
  limit: number;
  patientId: string;
  isValid?: boolean;
  sort?: 'ASC' | 'DESC' = 'DESC';
}

export class IFindBreathingExercisePrescriptionsBetweenDatesFilter {
  patientId: string;
  options?: {
    startDate?: Date;
    endDate?: Date;
    startDateSort?: 'ASC' | 'DESC';
  };
}
