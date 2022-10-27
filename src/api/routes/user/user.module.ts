import { ClinicianNoteModelModule } from './../../../models/clinician_note/clinician_note.model.module';
import { OrganizationSettingsModelModule } from './../../../models/organization-settings/organization-settings.model.module';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { NotificationServiceModule } from '../../../services/notification/notification.module';
import { UserModelModule } from '../../../models/user/user.model.module';
import { PatientInfoModelModule } from '../../../models/patient_info/patient_info.model.module';
import { DoctorInfoModelModule } from '../../../models/doctor_info/doctor_info.model.module';
import { PatientSupervisionMappingModelModule } from '../../../models/patient_supervision_mapping/patient_supervision_mapping.model.module';
import { CaretakerInfoModelModule } from '../../../models/caretaker_info/caretaker_info.model.module';
import { CalendarModule } from '../calendar/calendar.module';
import { OrganizationModelModule } from '../../../models/organization/organization.model.module';
@Module({
  imports: [
    UserModelModule,
    PatientInfoModelModule,
    DoctorInfoModelModule,
    CaretakerInfoModelModule,
    PatientSupervisionMappingModelModule,
    NotificationServiceModule,
    CalendarModule,
    ClinicianNoteModelModule,
    OrganizationModelModule,
    OrganizationSettingsModelModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
