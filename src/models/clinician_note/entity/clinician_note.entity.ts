import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';
import { Calendar } from '../../calendar/entity/calendar.entity';

@Entity()
export class ClinicianNote {
  @PrimaryGeneratedColumn('uuid')
  @Index('clinician_note_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'notes', type: 'text' })
  notes: string;

  @Column({ name: 'is_diagnosis', type: 'boolean', default: false })
  isDiagnosis?: boolean;

  @Column({ name: 'is_reminder', type: 'boolean', default: false })
  isReminder?: boolean;

  @Column({
    name: 'reminder_at',
    type: 'timestamp without time zone',
    nullable: true,
  })
  reminderAt: Date;

  @Column({
    name: 'patient_read_at',
    type: 'timestamp without time zone',
    nullable: true,
  })
  patientReadAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @Column({ name: 'created_by', nullable: true, type: 'varchar', length: 254 })
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
  })
  updatedBy?: string;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  deletedAt?: Date;

  @Column({ name: 'deleted_by', nullable: true, type: 'varchar', length: 254 })
  deletedBy?: string;

  @Column({ name: 'patient_id' })
  patientId: string;
  @ManyToOne(() => User, (user) => user.clinicianNotesPatient)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  // TODO: Change the doctorId and doctor fields to clinicianId and clinician as doctor and nurse Id can be used
  @Column({ name: 'doctor_id' })
  doctorId: string;
  @ManyToOne(() => User, (user) => user.clinicianNotesDoctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @Column({ name: 'calendar_id' })
  calendarId: string;
  @ManyToOne(() => Calendar, (calendar) => calendar.clinicianNotes)
  @JoinColumn({ name: 'calendar_id' })
  calendar: Calendar;
}
