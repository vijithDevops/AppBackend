import {
  IsNotEmpty,
  MaxLength,
  Length,
  IsEmail,
  IsOptional,
} from 'class-validator';
import { Address } from '../../../../models/user/types/index';
import { Gender, Role } from '../../../../models/user/entity/user.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(35)
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(8, 128)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(35)
  firstName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @MaxLength(35)
  middleName?: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(35)
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(20)
  phoneNumber: string;

  @ApiProperty({ enum: [...Object.values(Gender)] })
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    type: Address,
  })
  @IsOptional()
  address?: Address;

  @ApiProperty({ enum: [...Object.values(Role)] })
  @IsNotEmpty()
  role: Role;

  @ApiProperty({
    description: 'Id of Organization',
    required: false,
  })
  @IsOptional()
  organizationId?: string;

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
    description: 'DOB of patient and is required for patient role',
    required: false,
    type: Date,
  })
  @IsOptional()
  dob?: Date;

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
    description: 'nokName of patient and is required for patient role',
    required: false,
  })
  @IsOptional()
  nokName?: string;

  @ApiProperty({
    description: 'nokContactNumber of patient and is required for patient role',
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
    description: 'admissionDate of patient and is required for patient role',
    required: false,
  })
  @IsOptional()
  admissionDate?: Date;

  @ApiProperty({
    description: 'irisOnboardDate of patient and is required for patient role',
    required: false,
  })
  @IsOptional()
  irisOnboardDate?: Date;

  @ApiProperty({
    description: 'dischargeDate of patient',
    required: false,
  })
  @IsOptional()
  dischargeDate?: Date;

  @ApiProperty({
    description: 'expectedEndDate of patient',
    required: false,
  })
  @IsOptional()
  expectedEndDate?: Date;

  @ApiProperty({
    description: 'doctorInchargeId of patient',
    required: false,
  })
  @IsOptional()
  doctorInchargeId?: string;

  @ApiProperty({
    description: 'specialization of doctor and is required for doctor role',
    required: false,
  })
  @IsOptional()
  specialization?: string;

  @ApiProperty({
    description: 'relationship of patient and is required for caretaker role',
    required: false,
  })
  @IsOptional()
  relationship?: string;

  @ApiProperty({
    description: 'username of patient and is required for caretaker role',
    required: false,
  })
  @IsOptional()
  patientUsername?: string;

  // @ApiProperty({
  //   description:
  //     'Sensor MacId that should be attached to patint in Application mode',
  //   required: false,
  // })
  // @IsOptional()
  // macId?: string;
}
