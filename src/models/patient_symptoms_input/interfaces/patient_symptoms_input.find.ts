export class IFindPatientSymptomsInputsFilter {
  skip: number;
  limit: number;
  patientId: string;
  sort?: 'ASC' | 'DESC' = 'DESC';
}
