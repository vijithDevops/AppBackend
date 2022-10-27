import { Injectable } from '@nestjs/common';
import { NonMedicalNotification } from 'src/models/non_medical_notification/entity/non_medical_notification.entity';
import { PatientSupervisionMappingModelService } from 'src/models/patient_supervision_mapping/patient_supervision_mapping.model.service';

@Injectable()
export class NonMedicalNotificationService {
  constructor(
    private readonly patientSupervisionMappingModelService: PatientSupervisionMappingModelService,
  ) {}

  async getNotifyUsersForNonMedicalNotification(
    patientIds: string[],
    notificationSetings: NonMedicalNotification,
  ) {
    const notifyUsersWithAck = [];
    const notifyUsersWithoutAck = [];
    if (notificationSetings.patientAckRequired) {
      notifyUsersWithAck.push(...patientIds);
    }
    if (
      notificationSetings.notifyClinician ||
      notificationSetings.notifyCaregiver
    ) {
      const supervisors = await this.patientSupervisionMappingModelService.getPatientsSupervisorsId(
        patientIds,
      );
      if (
        notificationSetings.notifyClinician &&
        notificationSetings.notifyCaregiver
      ) {
        Object.keys(supervisors).forEach((key) => {
          if (
            supervisors[key]['incharge'] &&
            supervisors[key]['incharge'].length > 0
          ) {
            notifyUsersWithoutAck.push(...supervisors[key].incharge);
          }
          if (
            supervisors[key]['caretakers'] &&
            supervisors[key]['caretakers'].length > 0
          ) {
            if (notificationSetings.caregiverAckRequired) {
              notifyUsersWithAck.push(...supervisors[key].caretakers);
            } else {
              notifyUsersWithoutAck.push(...supervisors[key].caretakers);
            }
          }
        });
      } else if (notificationSetings.notifyCaregiver) {
        Object.keys(supervisors).forEach((key) => {
          if (
            supervisors[key]['caretakers'] &&
            supervisors[key]['caretakers'].length > 0
          ) {
            if (notificationSetings.caregiverAckRequired) {
              notifyUsersWithAck.push(...supervisors[key].caretakers);
            } else {
              notifyUsersWithoutAck.push(...supervisors[key].caretakers);
            }
          }
        });
      } else {
        Object.keys(supervisors).forEach((key) => {
          if (
            supervisors[key]['incharge'] &&
            supervisors[key]['incharge'].length > 0
          ) {
            notifyUsersWithoutAck.push(...supervisors[key].incharge);
          }
        });
      }
    }
    return { notifyUsersWithAck, notifyUsersWithoutAck };
  }
}
