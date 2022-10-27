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
  Unique,
} from 'typeorm';

import { UserAppointmentStatus } from './appointment.enum';
import { Appointment } from './appointment.entity';
import { User } from '../../user/entity/user.entity';

@Entity()
@Index(['userId', 'appointmentId'], {
  unique: true,
})
@Unique(['userId', 'appointmentId'])
export class AppointmentUsers {
  @PrimaryGeneratedColumn('uuid')
  @Index('appointment_user_id_uidx', { unique: true })
  id: string;

  @Column({
    type: 'enum',
    enum: UserAppointmentStatus,
    default: UserAppointmentStatus.PENDING,
  })
  status: UserAppointmentStatus;

  @Column({ name: 'user_id' })
  userId: string;
  @ManyToOne(() => User, (user) => user.userAppointments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'appointment_id' })
  appointmentId: string;
  @ManyToOne(() => Appointment, (appointment) => appointment.appointmentUsers)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ name: 'is_organizer', type: 'boolean', default: 0 })
  isOrganizer: boolean;

  @Column({ name: 'agora_uid', type: 'numeric', nullable: true })
  agoraUid?: number;

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
}
