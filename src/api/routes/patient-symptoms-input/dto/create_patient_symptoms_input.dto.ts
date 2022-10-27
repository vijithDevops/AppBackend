import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max } from 'class-validator';

export class CreatePatientSymptomsInputDto {
  @ApiProperty({ type: Number, required: true, description: 'max 5' })
  @IsInt()
  @Max(5)
  coughingScore: number;

  @ApiProperty({ type: Number, required: true, description: 'max 5' })
  @IsInt()
  @Max(5)
  phlegmScore: number;

  @ApiProperty({ type: Number, required: true, description: 'max 5' })
  @IsInt()
  @Max(5)
  chestTightnessScore: number;

  @ApiProperty({ type: Number, required: true, description: 'max 5' })
  @IsInt()
  @Max(5)
  breathlessnessScore: number;

  @ApiProperty({ type: Number, required: true, description: 'max 5' })
  @IsInt()
  @Max(5)
  limitedActivityScore: number;

  @ApiProperty({ type: Number, required: true, description: 'max 5' })
  @IsInt()
  @Max(5)
  troubleSleepingScore: number;

  @ApiProperty({ type: Number, required: true, description: 'max 5' })
  @IsInt()
  @Max(5)
  energyScore: number;
}
