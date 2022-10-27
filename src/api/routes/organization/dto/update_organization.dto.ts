import { PartialType } from '@nestjs/swagger';
import { CreateOrganizationDto } from './';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {}
