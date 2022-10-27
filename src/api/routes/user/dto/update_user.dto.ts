import { IsOptional, MaxLength, IsEmail } from 'class-validator';
import { Address } from '../../../../models/user/types/index';
import { Gender } from '../../../../models/user/entity/user.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @MaxLength(35)
  username?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @MaxLength(35)
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @MaxLength(35)
  middleName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @MaxLength(35)
  lastName?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiProperty({ enum: [...Object.values(Gender)], required: false })
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    type: Address,
  })
  @IsOptional()
  address?: Address;

  @ApiProperty({
    description: 'profile image id or url',
    required: false,
  })
  @IsOptional()
  profilePic?: string;

  @ApiProperty({
    description: 'thumbnail url',
    required: false,
  })
  @IsOptional()
  profilePicThumbnail?: string;

  @ApiProperty({
    description: 'DOB of patient',
    required: false,
  })
  @IsOptional()
  dob?: string;

  @ApiProperty({
    type: Number,
    description: 'age of patient',
    required: false,
  })
  @IsOptional()
  age?: number;

  @ApiProperty({
    description: 'diagnosis of patient and is required for patient role',
    required: false,
  })
  @IsOptional()
  diagnosis?: string;

  @ApiProperty({
    description: 'baseline medication Prescription of patient ',
    required: false,
  })
  @IsOptional()
  medicationPrescription?: string;

  @ApiProperty({
    description: 'height of patient and is required for patient role',
    required: false,
  })
  @IsOptional()
  height?: number;

  @ApiProperty({
    description: 'weight of patient and is required for patient role',
    required: false,
  })
  @IsOptional()
  weight?: number;

  @ApiProperty({
    description: 'baseline respiration Rate of patient ',
    required: false,
  })
  @IsOptional()
  respirationRate?: number;

  @ApiProperty({
    description: 'baseline heart Rate of patient ',
    required: false,
  })
  @IsOptional()
  heartRate?: number;

  @ApiProperty({
    description: 'baseline spo2 of patient ',
    required: false,
  })
  @IsOptional()
  spo2?: number;

  @ApiProperty({
    description: 'nokName of patient',
    required: false,
  })
  @IsOptional()
  nokName?: string;

  @ApiProperty({
    description: 'nokContactNumber of patient',
    required: false,
  })
  @IsOptional()
  nokContactNumber?: string;

  @ApiProperty({
    description: 'nokContactEmail of patient',
    required: false,
  })
  @IsOptional()
  nokContactEmail?: string;

  @ApiProperty({
    description: 'admissionDate of patient',
    required: false,
  })
  @IsOptional()
  admissionDate?: string;

  @ApiProperty({
    description: 'irisOnboardDate of patient',
    required: false,
  })
  @IsOptional()
  irisOnboardDate?: string;

  @ApiProperty({
    description: 'dischargeDate of patient',
    required: false,
  })
  @IsOptional()
  dischargeDate?: string;

  @ApiProperty({
    description: 'expectedEndDate of patient',
    required: false,
  })
  @IsOptional()
  expectedEndDate?: string;

  @ApiProperty({
    description: 'doctorInchargeId of patient',
    required: false,
  })
  @IsOptional()
  doctorInchargeId?: string;

  @ApiProperty({
    description: 'specialization of doctor',
    required: false,
  })
  @IsOptional()
  specialization?: string;

  @ApiProperty({
    description: 'caretaker relationship with patient ',
    required: false,
  })
  @IsOptional()
  relationship?: string;

  @ApiProperty({
    description: 'id of patient',
    required: false,
  })
  @IsOptional()
  patientId?: string;
}
