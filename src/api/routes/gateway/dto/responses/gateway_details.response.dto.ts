import { SensorDetailsResponseDto } from 'src/api/routes/sensor/dto/responses/sensor_details.response.dto';

export class GatewayDetailsResponseDto {
  id: string;
  name: string;
  macId: string;
  fwVersion?: string;
  isAvailable: boolean;
  isActive: boolean;
  isOnline: boolean;
  lastConnectionTime?: Date;
  createdAt: Date;
  updatedAt?: Date;
  patientId?: number;
  sensors: SensorDetailsResponseDto[];
}
