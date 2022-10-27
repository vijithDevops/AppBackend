import { IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SensorType } from 'src/models/sensor/entity/sensor.enum';

export class CreateSensorDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  macId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  fwVersion?: string;

  @ApiProperty({ enum: [...Object.values(SensorType)] })
  @IsOptional()
  sensorType: SensorType;

  @ApiProperty({ required: false, default: 180 })
  @Min(60)
  @IsOptional()
  pollingTimeInSeconds?: number;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  patientId?: string;
}
