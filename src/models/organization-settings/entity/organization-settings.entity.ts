import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Organization } from 'src/models/organization/entity/organization.entity';

@Entity('organization_settings')
export class OrganizationSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', unique: true })
  organizationId: string;
  @OneToOne(
    () => Organization,
    (organization: Organization) => organization.organizationSettings,
  )
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'access_code', type: 'varchar' })
  accessCode: string;

  @Column({ name: 'auth_token', type: 'varchar', nullable: true })
  authToken?: string;

  @Column({ name: 'api_enabled', type: 'boolean', default: 0 })
  apiEnabled: boolean;

  @Column({ name: 'client_url', type: 'varchar', nullable: true })
  clientUrl?: string;

  @Column({ name: 'data_store_url', type: 'varchar', nullable: true })
  dataStoreUrl?: string;

  @Column({ name: 'patient_profile', type: 'boolean', default: 1 })
  patientProfile: boolean;

  @Column({ name: 'clinical_trial', type: 'boolean', default: 0 })
  clinicalTrial: boolean;

  @Column({ name: 'patient_list', type: 'boolean', default: 1 })
  patientList: boolean;

  @Column({ name: 'export_data', type: 'boolean', default: 1 })
  exportData: boolean;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  updatedAt?: Date;
}
