import { OmitType } from '@nestjs/mapped-types';
import { UpdateSensorDto } from '../../../api/routes/sensor/dto';
import {
  DeviceConnectionMode,
  SensorProcessState,
  SensorProcessStateStatus,
  SensorState,
  SensorStateStatus,
  SensorType,
} from '../entity/sensor.enum';

export class IUpdateSensor extends OmitType(UpdateSensorDto, [
  'patientId',
] as const) {
  id: string;
  patientId?: number;
}

export class IUpdateSensorInfo {
  name?: string;
  macId?: string;
  fwVersion?: string;
  sensorType?: SensorType;
  isAvailable?: boolean;
  isActive?: boolean;
  lastProcessedState?: SensorProcessState;
  processedStateStatus?: SensorProcessStateStatus;
  sensorState?: SensorState;
  sensorStateStatus?: SensorStateStatus;
  connectionMode?: DeviceConnectionMode;
  isPaired?: boolean;
  unassignRequest?: boolean;
  patientDeviceRegistration?: boolean;
  lastConnectionTime?: Date;
  registeredTime?: Date;
  isRegistered?: boolean;
  gatewayId?: string;
  patientId?: number;
  pollingTimeInSeconds?: number;
}
