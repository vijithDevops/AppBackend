import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Address, Contact } from 'src/models/organization/types';

export class CreateOrganizationDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ type: 'object' })
  @IsNotEmpty()
  primaryContact: Contact;

  @ApiProperty({ type: 'object' })
  @IsOptional()
  secondaryContact: Contact;

  @ApiProperty({ type: 'object' })
  @IsOptional()
  address: Address;

  @ApiProperty()
  @IsOptional()
  timezone?: string;
}
