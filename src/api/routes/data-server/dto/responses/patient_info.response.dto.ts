export class PatientInfoResponseDto {
  id: string;
  patientId: number;
  patientIdString: string;
  patient: {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  };
  dob: Date;
  diagnosis?: string;
  medicationPrescription?: string;
  height?: number;
  weight?: number;
  respirationRate?: number;
  heartRate?: number;
  spo2?: number;
  admissionDate?: Date;
  irisOnboardDate?: Date;
  dischargeDate?: Date;
  expectedEndDate?: Date;
  nokName: string;
  nokContactNumber: string;
  nokContactEmail?: string;
}
