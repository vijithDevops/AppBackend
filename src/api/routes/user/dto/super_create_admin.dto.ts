import {
  IsNotEmpty,
  MaxLength,
  Length,
  IsEmail,
  IsOptional,
} from 'class-validator';
import { Address } from '../../../../models/user/types/index';
import { Gender } from '../../../../models/user/entity/user.enum';
import { ApiProperty } from '@nestjs/swagger';

export class SuperCreateAdminDto {
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
  @IsNotEmpty()
  address: Address;

  @ApiProperty({
    description: 'Id of Organization or Hospital',
    required: true,
  })
  @IsOptional()
  organizationId: string;

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
}
