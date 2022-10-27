import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';

@Entity()
export class CaretakerInfo {
  @PrimaryGeneratedColumn('uuid')
  @Index('caretaker_info_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'caretaker_id', unique: true })
  caretakerId: string;
  @OneToOne(() => User, (user) => user.caretakersPatient)
  @JoinColumn({ name: 'caretaker_id' })
  caretaker: User;

  @Column({ name: 'patient_id', nullable: true })
  patientId?: string;
  @ManyToOne(() => User, (user) => user.patientCaretakers)
  @JoinColumn({ name: 'patient_id' })
  patient?: User;

  @Column({ name: 'relationship', type: 'varchar', nullable: true })
  relationship?: string;

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
  })
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
}
