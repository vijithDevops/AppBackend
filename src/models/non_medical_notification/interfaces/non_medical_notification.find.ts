export class IFindAllNonMedicalNotifications {
  skip: number;
  limit: number;
  organizationId?: string;
  search?: string;
  sort?: 'ASC' | 'DESC' = 'DESC';
  notifyClinician?: boolean;
  notifyCaregiver?: boolean;
  patientAckRequired?: boolean;
  caregiverAckRequired?: boolean;
}
