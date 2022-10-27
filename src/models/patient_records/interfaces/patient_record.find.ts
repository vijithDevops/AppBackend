import { PatientRecordType } from '../entity/patient_record.enum';

export class IFindPatientRecordsFilter {
  skip: number;
  limit: number;
  type?: PatientRecordType;
  sort?: 'ASC' | 'DESC' = 'DESC';
}
