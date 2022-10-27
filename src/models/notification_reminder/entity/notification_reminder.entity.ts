import { BreatingExercisePrescription } from 'src/models/breathing_exercise_prescription/entity/breathing_exercise_prescription.entity';
import { MedicationPrescription } from 'src/models/medication_prescription/entity/medication_prescription.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { ReminderEvent } from './notification_reminder.enum';
import { NotificationReminderTime } from './notification_reminder_time.entity';

@Entity('notification_reminder')
@Unique(['patientId', 'type', 'isDefault', 'medicationPrescriptionId'])
@Unique(['patientId', 'type', 'isDefault', 'breathingPrescriptionId'])
export class NotificationReminder {
  @PrimaryGeneratedColumn('uuid')
  @Index('notification_reminder_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'patient_id', nullable: true })
  patientId?: string;
  @ManyToOne(() => User, (user) => user.patientNotificationReminders)
  @JoinColumn({ name: 'patient_id' })
  patient?: User;

  @Column({ name: 'type', type: 'enum', enum: ReminderEvent })
  type: ReminderEvent;

  @Column({ name: 'is_default', type: 'boolean', default: 0 })
  isDefault: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: 1 })
  isActive: boolean;

  @Column({ name: 'medication_prescription_id', nullable: true })
  medicationPrescriptionId?: string;
  @ManyToOne(
    () => MedicationPrescription,
    (prescription) => prescription.reminders,
  )
  @JoinColumn({ name: 'medication_prescription_id' })
  medicationPrescription: MedicationPrescription;

  @Column({ name: 'breathing_prescription_id', nullable: true })
  breathingPrescriptionId?: string;
  @ManyToOne(
    () => BreatingExercisePrescription,
    (prescription) => prescription.reminders,
  )
  @JoinColumn({ name: 'breathing_prescription_id' })
  breatingExercisePrescription: BreatingExercisePrescription;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp without time zone',
    select: false,
  })
  updatedAt?: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamp without time zone',
    select: false,
  })
  deletedAt?: Date;

  @OneToMany(
    () => NotificationReminderTime,
    (notificationReminderTime) => notificationReminderTime.notificationReminder,
  )
  reminderTimes: NotificationReminderTime[];
}
