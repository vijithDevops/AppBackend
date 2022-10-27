import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientHealthInputDto } from './create-patient-health-input.dto';

export class UpdatePatientHealthInputDto extends PartialType(
  CreatePatientHealthInputDto,
) {}
