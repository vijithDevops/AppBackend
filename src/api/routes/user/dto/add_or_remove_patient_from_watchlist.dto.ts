import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AddOrRemovePatientFromWatchlistDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ type: Boolean, required: true })
  @IsNotEmpty()
  isOnWatchlist: boolean;
}
