import { PatientInfoModelModule } from './../../../models/patient_info/patient_info.model.module';
import { Module } from '@nestjs/common';
import { NonMedicalNotificationService } from './non-medical-notification.service';
import { NonMedicalNotificationController } from './non-medical-notification.controller';
import { NonMedicalNotificationModelModule } from '../../../models/non_medical_notification/non_medical_notification.model.module';
import { OrganizationModelModule } from 'src/models/organization/organization.model.module';
import { UserModelModule } from '../../../models/user/user.model.module';
import { NotificationServiceModule } from 'src/services/notification/notification.module';
import { PatientSupervisionMappingModelModule } from 'src/models/patient_supervision_mapping/patient_supervision_mapping.model.module';

@Module({
  imports: [
    NonMedicalNotificationModelModule,
    OrganizationModelModule,
    UserModelModule,
    PatientInfoModelModule,
    PatientSupervisionMappingModelModule,
    NotificationServiceModule,
  ],
  controllers: [NonMedicalNotificationController],
  providers: [NonMedicalNotificationService],
})
export class NonMedicalNotificationModule {}
