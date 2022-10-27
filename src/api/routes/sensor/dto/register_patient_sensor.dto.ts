import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceConnectionMode } from 'src/models/sensor/entity/sensor.enum';

export class RegisterPatientSensorDto {
  @ApiProperty()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: [...Object.values(DeviceConnectionMode)],
    required: false,
  })
  @IsOptional()
  connectionMode?: DeviceConnectionMode;

  // @ApiProperty()
  // @IsNotEmpty()
  // macId: string;
}
