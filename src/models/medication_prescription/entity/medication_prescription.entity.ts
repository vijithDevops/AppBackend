import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';
import { PatientMedicationInput } from '../../patient_medication_input/entity/patient_medication_input.entity';
import { Calendar } from '../../calendar/entity/calendar.entity';
import { PatientReminders } from 'src/models/notification_reminder/entity/patient_reminders.view.entity';
import { NotificationReminder } from 'src/models/notification_reminder/entity/notification_reminder.entity';

@Entity()
export class MedicationPrescription {
  @PrimaryGeneratedColumn('uuid')
  @Index('medication_prescription_id_uidx', { unique: true })
  id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'is_active',
    type: Boolean,
    default: true,
  })
  isActive: boolean;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({
    name: 'refill_date',
    type: 'date',
    nullable: true,
  })
  refillDate?: Date;

  @Column({ type: 'int', nullable: true })
  quantity?: number;

  @Column({ type: 'int', nullable: true })
  intakeFrequencyPerDay?: number;

  @Column({ type: 'int', nullable: true })
  dosePerIntake?: number;

  @Column({ type: 'int', nullable: true })
  totalDosagePerDay?: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @Column({
    name: 'created_by',
    nullable: true,
    type: 'varchar',
    length: 254,
    select: false,
  })
  createdBy?: number;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  updatedAt?: Date;

  @Column({
    name: 'updated_by',
    nullable: true,
    type: 'varchar',
    length: 254,
    select: false,
  })
  updatedBy?: string;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamp without time zone',
    select: false,
  })
  deletedAt?: Date;

  @Column({
    name: 'deleted_by',
    nullable: true,
    type: 'varchar',
    length: 254,
    select: false,
  })
  deletedBy?: string;

  @Column({ name: 'patient_id' })
  patientId: string;
  @ManyToOne(() => User, (user) => user.medicationPrescriptions)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @OneToMany(
    () => PatientMedicationInput,
    (patientMedicationInput) => patientMedicationInput.medicationPrescription,
  )
  patientMedicationInputs: PatientMedicationInput[];

  @OneToMany(
    () => NotificationReminder,
    (notificationReminder) => notificationReminder.medicationPrescription,
  )
  reminders: NotificationReminder[];

  @OneToMany(
    () => PatientReminders,
    (patientReminders) => patientReminders.medicationPrescription,
  )
  patientReminders: PatientReminders[];

  @Column({ name: 'calendar_id' })
  calendarId: string;
  @ManyToOne(() => Calendar, (calendar) => calendar.medicationPrescriptions)
  @JoinColumn({ name: 'calendar_id' })
  calendar: Calendar;
}
