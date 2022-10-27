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
  OneToMany,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';
import { Calendar } from '../../calendar/entity/calendar.entity';
import { AppointmentStatus, AppointmentType } from './appointment.enum';
import { AppointmentUsers } from './appointment_users.entity';
import { Organization } from 'src/models/organization/entity/organization.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  @Index('appointment_id_uidx', { unique: true })
  id: string;

  @Column({ type: 'varchar', nullable: true, default: 'Appointment' })
  title?: string;

  @Column({
    name: 'start_time',
    type: 'timestamp without time zone',
  })
  startTime: Date;

  @Column({
    name: 'end_time',
    type: 'timestamp without time zone',
  })
  endTime: Date;

  @Column({ type: 'enum', enum: AppointmentType })
  type: AppointmentType;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ name: 'is_ack_required', type: 'boolean', default: 0 })
  isAckRequired: boolean;

  @Column({ name: 'auto_confirm', type: 'boolean', default: 0 })
  autoConfirm: boolean;

  @Column({ name: 'video_url', type: 'varchar', nullable: true })
  videoUrl?: string;

  @Column({ name: 'reminder_id', type: 'varchar', nullable: true })
  reminderId?: string;

  @Column({ name: 'patient_id' })
  patientId: string;
  @ManyToOne(() => User, (user) => user.patientAppointments)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ name: 'doctor_id' })
  doctorId: string;
  @ManyToOne(() => User, (user) => user.doctorAppointments)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @Column({ name: 'calendar_id' })
  calendarId: string;
  @ManyToOne(() => Calendar, (calendar) => calendar.appointments)
  @JoinColumn({ name: 'calendar_id' })
  calendar: Calendar;

  @Column({ name: 'secret', type: 'varchar', nullable: true, select: false })
  secret?: string;

  @Column({ name: 'salt', type: 'varchar', nullable: true, select: false })
  salt?: string;

  @Column({
    name: 'organization_id',
    nullable: true,
  })
  organizationId: string;
  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.appointments,
  )
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;

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
    select: false,
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

  @OneToMany(
    () => AppointmentUsers,
    (appointmentUser) => appointmentUser.appointment,
  )
  appointmentUsers: AppointmentUsers[];
}
