export class IFindPatientHealthInputsFilter {
  skip: number;
  limit: number;
  patientId: string;
  sort?: 'ASC' | 'DESC' = 'DESC';
}
