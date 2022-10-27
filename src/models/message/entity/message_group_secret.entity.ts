import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('message_group_secret')
export class MessageGroupSecret {
  @PrimaryGeneratedColumn('uuid')
  @Index('chat_group_secret_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'chat_id', type: 'varchar', unique: true })
  chatId: string;

  @Column({ name: 'salt', type: 'varchar', unique: true })
  salt: string;

  @Column({ name: 'secret', type: 'varchar', unique: true })
  secret: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;
}
