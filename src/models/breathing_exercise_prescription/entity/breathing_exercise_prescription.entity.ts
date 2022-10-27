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
import { Calendar } from '../../calendar/entity/calendar.entity';
import { PatientBreathingInput } from '../../patient_breathing_input/entity/patient_breathing_input.entity';
import { PatientReminders } from 'src/models/notification_reminder/entity/patient_reminders.view.entity';
import { NotificationReminder } from 'src/models/notification_reminder/entity/notification_reminder.entity';

@Entity()
export class BreatingExercisePrescription {
  @PrimaryGeneratedColumn('uuid')
  @Index('breathing_exercise_prescription_id_uidx', { unique: true })
  id: string;

  @Column({ type: 'text' })
  prescription: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ type: 'int' })
  exerciseCountPerDay: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp without time zone',
  })
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
  @ManyToOne(() => User, (user) => user.breathingExercisePrescriptions)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @OneToMany(
    () => PatientBreathingInput,
    (patientMedicationInput) =>
      patientMedicationInput.breatingExercisePrescription,
  )
  patientBreathingInputs: PatientBreathingInput[];

  @OneToMany(
    () => NotificationReminder,
    (notificationReminder) => notificationReminder.breatingExercisePrescription,
  )
  reminders: NotificationReminder[];

  @OneToMany(
    () => PatientReminders,
    (patientReminders) => patientReminders.breatingExercisePrescription,
  )
  patientReminders: PatientReminders[];

  @Column({ name: 'calendar_id' })
  calendarId: string;
  @ManyToOne(
    () => Calendar,
    (calendar) => calendar.breathingExercisePrescriptions,
  )
  @JoinColumn({ name: 'calendar_id' })
  calendar: Calendar;
}
