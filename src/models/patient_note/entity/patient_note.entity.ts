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
export class PatientNote {
  @PrimaryGeneratedColumn('uuid')
  @Index('patient_note_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'notes', type: 'text' })
  notes: string;

  @Column({ name: 'is_doctor_attn', type: 'boolean', default: false })
  isDoctorAttn?: boolean;

  @Column({
    name: 'doctor_read_at',
    type: 'timestamp without time zone',
    nullable: true,
  })
  doctorReadAt?: Date;

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

  @Column({ name: 'updated_by', nullable: true, type: 'varchar', length: 254 })
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
  @ManyToOne(() => User, (user) => user.patientNotesPatient)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ name: 'doctor_id', nullable: true })
  doctorId?: string;
  @ManyToOne(() => User, (user) => user.patientNotesDoctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @Column({ name: 'calendar_id' })
  calendarId: string;
  @ManyToOne(() => Calendar, (calendar) => calendar.patientNotes)
  @JoinColumn({ name: 'calendar_id' })
  calendar: Calendar;
}
