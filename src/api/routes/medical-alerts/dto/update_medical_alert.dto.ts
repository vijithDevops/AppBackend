import { IsOptional, IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  ResolutionType,
  RiskReadingType,
  RiskStratification,
} from 'src/models/medical_alerts/entity/medical_alerts.enum';

export class UpdateVitalSignsDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  key: string;

  @ApiProperty({ type: Boolean, required: true })
  @IsNotEmpty()
  isApplicable: boolean;

  @ApiProperty({ type: Number, required: true })
  amberValue: number;

  @ApiProperty({ type: Number, required: true })
  redValue: number;
}

export class UpdateMedicalAlertNotificationSettingsDto {
  [key: string]: string;
}

export class UpdateMedicalAlertDto {
  @ApiProperty({ required: false })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    enum: [...Object.values(ResolutionType)],
    default: ResolutionType.DAILY,
  })
  @IsOptional()
  resolution?: ResolutionType;

  @ApiProperty({
    enum: [...Object.values(RiskStratification)],
    default: RiskStratification.BINARY,
  })
  @IsOptional()
  riskStratification?: RiskStratification;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  amberRiskApplicability?: boolean;

  @ApiProperty({
    enum: [...Object.values(RiskReadingType)],
    default: RiskReadingType.CONSECUTIVE,
  })
  @IsOptional()
  amberRiskReadingType?: RiskReadingType;

  @ApiProperty({ required: false, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  amberRiskReadingChoice?: number;

  @ApiProperty({ required: false, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  amberRiskReadingOutOf?: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  notifyAmberRisk?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  redRiskApplicability?: boolean;

  @ApiProperty({
    enum: [...Object.values(RiskReadingType)],
    default: RiskReadingType.CONSECUTIVE,
  })
  @IsOptional()
  redRiskReadingType?: RiskReadingType;

  @ApiProperty({ required: false, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  redRiskReadingChoice?: number;

  @ApiProperty({ required: false, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  redRiskReadingOutOf?: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  notifyRedRisk?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  greenRiskApplicability?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  notifyGreenRisk?: boolean;

  @ApiProperty({ required: false, default: 2 })
  @IsInt()
  @Min(0)
  @IsOptional()
  consecutiveAmberRisk?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  reactivationHours?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  reactivationDays?: number;

  @ApiProperty({
    required: false,
    isArray: true,
    type: () => UpdateVitalSignsDto,
  })
  vitalSigns?: UpdateVitalSignsDto[];

  @ApiProperty({
    required: false,
    type: () => UpdateMedicalAlertNotificationSettingsDto,
  })
  notificationMessageTemplates?: UpdateMedicalAlertNotificationSettingsDto;
}
