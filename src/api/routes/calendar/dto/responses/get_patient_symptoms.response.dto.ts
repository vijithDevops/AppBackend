import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PatientSymptomsResponseDto {
  @ApiProperty({
    example: [
      '2021-6-1',
      '2021-6-2',
      '2021-6-3',
      '2021-6-4',
      '2021-6-5',
      '2021-6-6',
      '2021-6-7',
    ],
  })
  @IsNotEmpty()
  dateArray: string[];

  @ApiProperty({
    example: [1, 2, 3, -1, 2, 3, 1],
  })
  @IsNotEmpty()
  coughingScore: number[];

  @ApiProperty({
    example: [-1, 2, 3, 1, 2, 3, 1],
  })
  @IsNotEmpty()
  phlegmScore: number[];

  @ApiProperty({
    example: [1, 2, 3, -1, 2, 3, 1],
  })
  @IsNotEmpty()
  chestTightnessScore: number[];

  @ApiProperty({
    example: [1, 2, 3, -1, 2, 3, 1],
  })
  @IsNotEmpty()
  breathlessnessScore: number[];

  @ApiProperty({
    example: [-1, -1, 3, 1, 2, 3, 1],
  })
  @IsNotEmpty()
  limitedActivityScore: number[];

  @ApiProperty({
    example: [1, 2, 3, 1, 2, 3, 1],
  })
  @IsNotEmpty()
  troubleSleepingScore: number[];

  @ApiProperty({
    example: [1, 2, 3, -1, 2, 3, -1],
  })
  @IsNotEmpty()
  energyScore: number[];

  @ApiProperty({
    example: [1, 1, 3, -1, 2, 3, -1],
  })
  @IsNotEmpty()
  totalScore: number[];
}
