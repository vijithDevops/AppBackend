export class IUpdateNonMedicalNotification {
  message?: string;
  fieldId?: string;
  notifyClinician?: boolean;
  notifyCaregiver?: boolean;
  patientAckRequired?: boolean;
  caregiverAckRequired?: boolean;
}
