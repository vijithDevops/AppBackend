import { GatewayDetailsResponseDto } from 'src/api/routes/gateway/dto/responses/gateway_details.response.dto';
import { SensorDetailsResponseDto } from 'src/api/routes/sensor/dto/responses/sensor_details.response.dto';

export class patientDevicesResponseDto {
  sensors: SensorDetailsResponseDto[];
  gateways: GatewayDetailsResponseDto[];
}
