import { IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceConnectionMode } from 'src/models/sensor/entity/sensor.enum';

export class AssignSensorPatientDto {
  @ApiProperty()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty()
  @IsNotEmpty()
  sensorId: string;

  @ApiProperty({
    enum: [...Object.values(DeviceConnectionMode)],
    required: false,
  })
  @IsOptional()
  connectionMode?: DeviceConnectionMode;

  @ApiProperty({ required: false, default: 180 })
  @Min(60)
  @IsOptional()
  pollingTimeInSeconds?: number;
}
