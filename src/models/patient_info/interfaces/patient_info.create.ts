export class ICreatePatientInfo {
  userId: string;
  dob?: Date;
  diagnosis?: string;
  medicationPrescription?: string;
  height?: number;
  weight?: number;
  respirationRate?: number;
  heartRate?: number;
  spo2?: number;
  nokName?: string;
  nokContactNumber?: string;
  nokContactEmail?: string;
  admissionDate?: Date;
  irisOnboardDate?: Date;
  dischargeDate?: Date;
  expectedEndDate?: Date;
}
