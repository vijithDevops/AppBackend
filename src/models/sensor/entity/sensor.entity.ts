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

import { Gateway } from '../../gateway/entity/gateway.entity';
import {
  DeviceConnectionMode,
  SensorProcessState,
  SensorProcessStateStatus,
  SensorState,
  SensorStateStatus,
  SensorType,
} from './sensor.enum';
import { PatientInfo } from '../../patient_info/entity/patient_info.entity';
import { Organization } from 'src/models/organization/entity/organization.entity';

@Entity('sensor')
export class Sensor {
  @PrimaryGeneratedColumn('uuid')
  @Index('sensor_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 20 })
  name: string;

  @Column({ name: 'macid', type: 'varchar' })
  macId: string;

  @Column({ name: 'fw_version', type: 'varchar', length: 20, nullable: true })
  fwVersion?: string;

  @Column({
    name: 'sensor_type',
    type: 'enum',
    enum: SensorType,
    default: SensorType.GEN,
  })
  sensorType: SensorType;

  @Column({
    name: 'polling_time_in_seconds',
    type: 'integer',
    default: 180,
  })
  pollingTimeInSeconds: number;

  @Column({
    name: 'is_available',
    type: 'boolean',
    default: true,
  })
  isAvailable: boolean;

  // Patient can only have 1 active device at a time
  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

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

  @Column({
    name: 'last_processed_state',
    type: 'enum',
    enum: SensorProcessState,
    default: SensorProcessState.AVAILABLE,
  })
  lastProcessedState: SensorProcessState;

  @Column({
    name: 'processed_state_status',
    type: 'enum',
    enum: SensorProcessStateStatus,
    default: SensorProcessStateStatus.SUCCESS,
  })
  processedStateStatus: SensorProcessStateStatus;

  @Column({
    name: 'sensor_state',
    type: 'enum',
    enum: SensorState,
    default: SensorState.UNASSIGN,
  })
  sensorState: SensorState;

  @Column({
    name: 'sensor_state_status',
    type: 'enum',
    enum: SensorStateStatus,
    default: SensorStateStatus.SUCCESS,
  })
  sensorStateStatus: SensorStateStatus;

  @Column({
    name: 'connection_mode',
    type: 'enum',
    enum: DeviceConnectionMode,
    nullable: true,
  })
  connectionMode?: DeviceConnectionMode;

  @Column({ name: 'is_paired', type: 'boolean', default: false })
  isPaired: boolean;

  @Column({ name: 'unassign_request', type: 'boolean', default: false })
  unassignRequest: boolean;

  @Column({
    name: 'patient_device_registration',
    type: 'boolean',
    default: false,
  })
  patientDeviceRegistration: boolean;

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

  @Column({ name: 'gateway_id', nullable: true })
  gatewayId?: string;
  @ManyToOne(() => Gateway, (gateway) => gateway.sensors)
  @JoinColumn({ name: 'gateway_id' })
  gateway: Gateway;

  @Column({ name: 'patient_id', nullable: true })
  patientId?: number;
  @ManyToOne(() => PatientInfo, (patientInfo) => patientInfo.sensors)
  @JoinColumn({
    name: 'patient_id',
    referencedColumnName: 'patientId',
  })
  patient: PatientInfo;

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string;
  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.sensors,
  )
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;
}
