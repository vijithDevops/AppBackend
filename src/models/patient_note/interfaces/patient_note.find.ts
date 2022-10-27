export class IFindAllPatientNotes {
  sort?: 'ASC' | 'DESC' = 'DESC';
  date?: string;
  day?: string;
  isDoctorAttn?: boolean;
  skip: number;
  limit: number;
}
