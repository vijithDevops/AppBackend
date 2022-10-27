import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  OneToOne,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  CreateDateColumn,
  AfterUpdate,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';

@Entity()
export class PasswordChangeRequest {
  @PrimaryGeneratedColumn('uuid')
  @Index('password_change_request_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;
  @OneToOne(() => User, (user) => user.passwordChangeRequest)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int' })
  otp: number;

  @Column({
    name: 'otp_generated_at',
    nullable: false,
    type: 'timestamp without time zone',
    default: new Date(),
  })
  otpGeneratedAt?: Date;

  @Column({ name: 'is_otp_verified', type: 'boolean' })
  isOtpVerified: boolean;

  @Column({ name: 'generated_count', type: 'int', default: 1 })
  generatedCount: number;

  @Column({
    name: 'otp_verified_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  otpVerifiedAt?: Date;

  @Column({ name: 'is_expired', type: 'boolean', default: true })
  isExpired: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp without time zone',
  })
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

  @AfterUpdate()
  updateGeneratedCount() {
    this.generatedCount = this.generatedCount + 1;
  }
}
