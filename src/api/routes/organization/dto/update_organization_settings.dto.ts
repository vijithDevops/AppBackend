import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrganizationSettingsDto {
  @ApiProperty()
  @IsOptional()
  accessCode?: string;

  @ApiProperty()
  @IsOptional()
  apiEnabled?: boolean;

  @ApiProperty()
  @IsOptional()
  clientUrl?: string;

  @ApiProperty()
  @IsOptional()
  authToken?: string;

  @ApiProperty()
  @IsOptional()
  dataStoreUrl?: string;

  @ApiProperty()
  @IsOptional()
  patientProfile?: boolean;

  @ApiProperty()
  @IsOptional()
  clinicalTrial?: boolean;

  @ApiProperty()
  @IsOptional()
  patientList?: boolean;

  @ApiProperty()
  @IsOptional()
  exportData?: boolean;
}
