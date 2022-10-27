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

import { User } from '../../user/entity/user.entity';
import { MessageGroup } from './message_group.entity';

@Entity()
@Index(['userId', 'messageGroupId'], {
  unique: true,
})
@Unique(['userId', 'messageGroupId'])
export class MessageGroupUsers {
  @PrimaryGeneratedColumn('uuid')
  @Index('message_group_users_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'user_id' })
  userId: string;
  @ManyToOne(() => User, (user) => user.userMessageGroups)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'message_group_id' })
  messageGroupId: string;
  @ManyToOne(() => MessageGroup, (messageGroup) => messageGroup.users)
  @JoinColumn({ name: 'appointment_id' })
  messageGroup: MessageGroup;

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
