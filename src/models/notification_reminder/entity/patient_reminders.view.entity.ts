import {
  ViewEntity,
  ViewColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Role } from 'src/models/user/entity/user.enum';
import { MedicationPrescription } from 'src/models/medication_prescription/entity/medication_prescription.entity';
import { BreatingExercisePrescription } from 'src/models/breathing_exercise_prescription/entity/breathing_exercise_prescription.entity';
import { ReminderEvent } from './notification_reminder.enum';
import { NotificationReminderTime } from './notification_reminder_time.entity';
import { User } from 'src/models/user/entity/user.entity';

@ViewEntity({
  name: 'patient_reminders',
  expression: `
    (
      SELECT
        CASE  
          WHEN  userDefaultReminder.id IS NOT NULL
            THEN  userDefaultReminder.id
            ELSE  defaultReminder.id
          END                                     AS  id,
          CASE  
          WHEN  userDefaultReminder.id IS NOT NULL
            THEN  userDefaultReminder.is_active
            ELSE  defaultReminder.is_active
          END                                     AS  is_active,
        patient.id                                AS  patient_id,
        defaultReminder.type                      AS  type,
        true                                      AS  is_default,
        null                                      AS  medication_prescription_id,
        null                                      AS  breathing_prescription_id
      FROM "users" patient
        LEFT JOIN "notification_reminder" defaultReminder
            ON
              defaultReminder.is_default = true AND
              defaultReminder.patient_id IS NULL
        LEFT JOIN "notification_reminder" userDefaultReminder
            ON  
              userDefaultReminder.is_default = true AND
              userDefaultReminder.patient_id = patient.id AND
              userDefaultReminder.type = defaultReminder.type
      WHERE patient.role = '${Role.PATIENT}' AND patient.deleted_at IS NULL
    )
    UNION
    (
      SELECT
        userReminder.id                           AS  id,
        userReminder.is_active                    AS  is_active,
        userReminder.patient_id                   AS  patient_id,
        userReminder.type                         AS  type,
        false                                     AS  is_default,
        userReminder.medication_prescription_id   AS  medication_prescription_id,
        userReminder.breathing_prescription_id    AS  breathing_prescription_id
      FROM "notification_reminder"  userReminder
      WHERE 
        userReminder.is_default = false AND
        userReminder.patient_id IS NOT NULL
    )
  `,
})
export class PatientReminders {
  @ViewColumn()
  id: string;

  @ViewColumn({ name: 'is_active' })
  isActive: boolean;

  @ViewColumn({ name: 'patient_id' })
  patientId: string;
  @ManyToOne(() => User, (user) => user.patientRemindersView)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @ViewColumn({ name: 'type' })
  type: ReminderEvent;

  @ViewColumn({ name: 'is_default' })
  isDefault: boolean;

  @ViewColumn({ name: 'medication_prescription_id' })
  medicationPrescriptionId: string;
  @ManyToOne(
    () => MedicationPrescription,
    (prescription) => prescription.patientReminders,
  )
  @JoinColumn({ name: 'medication_prescription_id' })
  medicationPrescription: MedicationPrescription;

  @ViewColumn({ name: 'breathing_prescription_id' })
  breathingPrescriptionId: string;
  @ManyToOne(
    () => BreatingExercisePrescription,
    (prescription) => prescription.patientReminders,
  )
  @JoinColumn({ name: 'breathing_prescription_id' })
  breatingExercisePrescription: BreatingExercisePrescription;

  @OneToMany(
    () => NotificationReminderTime,
    (notificationReminderTime) => notificationReminderTime.notificationReminder,
  )
  reminderTimes: NotificationReminderTime[];
}
