import { PatientRecordType } from '../entity/patient_record.enum';

export class ICreatePatientRecord {
  patientId: string;
  type: PatientRecordType;
  fileId?: string;
  description?: string;
}
