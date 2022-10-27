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
import { DeviceType } from './user_app_device.enum';

@Entity()
export class UserAppDevice {
  @PrimaryGeneratedColumn('uuid')
  @Index('user_app_device_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'user_id' })
  userId: string;
  @ManyToOne(() => User, (user) => user.userDevices)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'device_token', type: 'varchar', length: 200 })
  deviceToken: string;

  @Column({ name: 'device_type', type: 'varchar', enum: DeviceType })
  deviceType: DeviceType;

  @Column({ name: 'app_version', type: 'varchar', length: 10 })
  appVersion: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  updatedAt?: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  deletedAt?: Date;
}
