export class IFindAllClinicianNotes {
  sort?: 'ASC' | 'DESC' = 'DESC';
  isDiagnosis?: boolean;
  date?: string;
  day?: string;
  skip: number;
  limit: number;
}
