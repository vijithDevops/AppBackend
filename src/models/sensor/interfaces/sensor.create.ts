import { OmitType } from '@nestjs/mapped-types';
import { CreateSensorDto } from '../../../api/routes/sensor/dto';
import { SensorType } from '../entity/sensor.enum';

export class ICreateSensor extends OmitType(CreateSensorDto, [
  'patientId',
] as const) {
  name: string;
  macId: string;
  fwVersion?: string;
  pollingTimeInSeconds?: number;
  sensorType: SensorType;
  patientId?: number;
}
