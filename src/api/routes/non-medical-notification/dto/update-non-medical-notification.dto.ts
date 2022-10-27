import { PartialType } from '@nestjs/swagger';
import { CreateNonMedicalNotificationDto } from './create-non-medical-notification.dto';

export class UpdateNonMedicalNotificationDto extends PartialType(
  CreateNonMedicalNotificationDto,
) {}
