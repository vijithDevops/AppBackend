import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from 'src/models/organization/entity/organization.entity';
import { VitalSignsMaster } from './vital_signs_master.entity';

@Entity('organization_vital_signs')
@Unique(['vitalSignId', 'organizationId'])
export class OrganizationVitalSigns {
  @PrimaryGeneratedColumn('uuid')
  @Index('organization_vital_signs_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'vital_sign_id' })
  vitalSignId: string;
  @ManyToOne(
    () => VitalSignsMaster,
    (vitalSignsMaster) => vitalSignsMaster.organizationVitalSigns,
  )
  @JoinColumn({ name: 'vital_sign_id' })
  vitalSign: VitalSignsMaster;

  @Column({ name: 'organization_id' })
  organizationId: string;
  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.organizationVitalSigns,
  )
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({
    name: 'is_applicable',
    type: Boolean,
    default: true,
  })
  isApplicable: boolean;

  @Column({ name: 'amber_value', type: 'real' })
  amberValue: number;

  @Column({ name: 'red_value', type: 'real' })
  redValue: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp without time zone',
    select: false,
  })
  updatedAt?: Date;
}
