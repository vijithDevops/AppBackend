import { OmitType } from '@nestjs/mapped-types';
import { UpdateGatewayDto } from 'src/api/routes/gateway/dto';

export class IUpdateGateway extends OmitType(UpdateGatewayDto, [
  'patientId',
] as const) {
  id: string;
  patientId?: number;
}

export class IUpdateGatewayInfo {
  name?: string;
  macId?: string;
  fwVersion?: string;
  isAvailable?: boolean;
  isActive?: boolean;
  isOnline?: boolean;
  lastConnectionTime?: Date;
  patientId?: number;
  isRegistered?: boolean;
  registeredTime?: Date;
  unassignRequest?: boolean;
}
