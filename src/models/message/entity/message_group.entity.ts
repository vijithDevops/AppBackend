import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { MessageGroupType } from './message.enum';
import { MessageGroupUsers } from './message_group_users.entity';

@Entity('message_group')
export class MessageGroup {
  @PrimaryGeneratedColumn('uuid')
  @Index('chat_group_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'enum', enum: MessageGroupType })
  type: MessageGroupType;

  // @Column({ name: 'organization_id' })
  // organizationId: string;
  // @ManyToOne(
  //   () => Organization,
  //   (organization: Organization) => organization.messageGroups,
  // )
  // @JoinColumn({ name: 'organization_id' })
  // organization: Organization;

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
    () => MessageGroupUsers,
    (messageGroupUsers) => messageGroupUsers.messageGroup,
  )
  users: MessageGroupUsers[];
}
