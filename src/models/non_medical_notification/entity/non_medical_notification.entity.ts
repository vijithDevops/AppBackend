import { Organization } from 'src/models/organization/entity/organization.entity';
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

@Entity()
@Index('organization_fieldId_uidx', ['fieldId', 'organizationId'], {
  unique: true,
})
export class NonMedicalNotification {
  @PrimaryGeneratedColumn('uuid')
  @Index('non_medical_notification_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({ name: 'field_id', type: 'varchar' })
  fieldId: string;

  @Column({ name: 'organization_id' })
  organizationId: string;
  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.nonMedicalNotifications,
  )
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'notify_clinician', type: 'boolean', default: 0 })
  notifyClinician: boolean;

  @Column({ name: 'notify_caregiver', type: 'boolean', default: 0 })
  notifyCaregiver: boolean;

  @Column({ name: 'patient_ack_required', type: 'boolean', default: 0 })
  patientAckRequired: boolean;

  @Column({ name: 'caregiver_ack_required', type: 'boolean', default: 0 })
  caregiverAckRequired: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
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
}
