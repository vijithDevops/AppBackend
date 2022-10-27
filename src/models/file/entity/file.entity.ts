import {
  Entity,
  Column,
  PrimaryColumn,
  Index,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';
import { PatientRecord } from '../../patient_records/entity/patient_record.entity';
import { Organization } from '../../organization/entity/organization.entity';

@Entity()
export class File {
  // Add UUID to original file name
  @Index('file_id_uidx', { unique: true })
  @PrimaryColumn({ name: 'id' })
  id: string;

  @Column({ name: 'user_id' })
  userId: string;
  @ManyToOne(() => User, (user) => user.files)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'location', unique: true })
  location: string;

  @Column({ name: 'thumbnail', type: 'varchar', nullable: true })
  thumbnail?: string;

  @Column({ name: 'mime_type', type: 'varchar', nullable: true })
  mimeType?: string;

  @Column({ name: 'size', type: 'integer', nullable: true })
  size?: number;

  @Column({ name: 'organization_id', nullable: true })
  organizationId?: string;
  @ManyToOne(() => Organization, (organization) => organization.files)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

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

  @OneToOne(() => PatientRecord, (patientRecord) => patientRecord.file)
  patientRecord: PatientRecord;
}
