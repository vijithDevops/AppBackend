export class ICreateNonMedicalNotification {
  organizationId: string;
  message: string;
  fieldId: string;
  notifyClinician?: boolean;
  notifyCaregiver?: boolean;
  patientAckRequired?: boolean;
  caregiverAckRequired?: boolean;
}
