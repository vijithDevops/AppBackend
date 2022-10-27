import { OmitType } from '@nestjs/mapped-types';
import { CreateGatewayDto } from 'src/api/routes/gateway/dto';

export class ICreateGateway extends OmitType(CreateGatewayDto, [
  'patientId',
] as const) {
  patientId?: number;
  isAvailable?: boolean;
}
