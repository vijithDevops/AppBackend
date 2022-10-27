import { Organization } from 'src/models/organization/entity/organization.entity';
import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { PatientInfo } from '../../patient_info/entity/patient_info.entity';
import { Sensor } from '../../sensor/entity/sensor.entity';
import { GatewayType } from './gateway.enum';

@Entity()
export class Gateway {
  @PrimaryGeneratedColumn('uuid')
  @Index('gateway_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 20 })
  name: string;

  @Column({ name: 'macid', type: 'varchar' })
  macId: string;

  @Column({ name: 'fw_version', type: 'varchar', length: 20, nullable: true })
  fwVersion?: string;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable: boolean;

  // Patient can only have 1 active device at a time
  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  @Column({ name: 'is_online', type: 'boolean', default: false })
  isOnline: boolean;

  @Column({
    name: 'last_connection_time',
    type: 'timestamp without time zone',
    nullable: true,
  })
  lastConnectionTime?: Date;

  @Column({
    name: 'registered_time',
    type: 'timestamp without time zone',
    nullable: true,
  })
  registeredTime?: Date;

  @Column({ name: 'is_registered', type: 'boolean', default: false })
  isRegistered: boolean;

  @Column({ name: 'unassign_request', type: 'boolean', default: false })
  unassignRequest: boolean;

  @Column({
    name: 'type',
    type: 'enum',
    enum: GatewayType,
    default: GatewayType.GATEWAY,
  })
  type: GatewayType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @Column({ name: 'created_by', nullable: true, type: 'varchar', length: 254 })
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

  @Column({ name: 'patient_id', nullable: true })
  patientId?: number;
  @ManyToOne(() => PatientInfo, (patientInfo) => patientInfo.gateways)
  @JoinColumn({
    name: 'patient_id',
    referencedColumnName: 'patientId',
  })
  patient: PatientInfo;

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string;
  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.gateways,
  )
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;

  @OneToMany(() => Sensor, (sensor) => sensor.gateway)
  sensors: Sensor[];
}
