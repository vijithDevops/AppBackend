import { GatewayDetailsResponseDto } from 'src/api/routes/gateway/dto/responses/gateway_details.response.dto';
import { SensorType } from 'src/models/sensor/entity/sensor.enum';

export class SensorDetailsResponseDto {
  id: string;
  name: string;
  macId: string;
  fwVersion?: string;
  sensorType: SensorType;
  isAvailable: boolean;
  isActive: boolean;
  lastConnectionTime?: Date;
  registeredTime?: Date;
  isRegistered: boolean;
  createdAt: Date;
  updatedAt?: Date;
  gatewayId?: string;
  patientId?: number;
  gateway: GatewayDetailsResponseDto;
}
