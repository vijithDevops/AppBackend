import { SymptomsQuestionnaireModule } from './symptoms-questionnaire/symptoms-questionnaire.module';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ClinicianNoteModule } from './clinician-note/clinician-note.module';
import { PatientNoteModule } from './patient-note/patient-note.module';
import { PatientHealthInputModule } from './patient-health-input/patient-health-input.module';
import { CalendarModule } from './calendar/calendar.module';
import { PatientAlertSettingsModule } from './patient-alert-settings/patient-alert-settings.module';
import { PatientSymptomsInputModule } from './patient-symptoms-input/patient-symptoms-input.module';
import { PatientBreathingInputModule } from './patient-breathing-input/patient-breathing-input.module';
import { AppointmentModule } from './appointment/appointment.module';
import { MedicationPrescriptionModule } from './medication-prescription/medication-prescription.module';
import { PatientMedicationInputModule } from './patient-medication-input/patient-medication-input.module';
import { SensorModule } from './sensor/sensor.module';
import { GatewayModule } from './gateway/gateway.module';
import { MessageModule } from './message/message.module';
import { ForgotPasswordModule } from './forgot-password/forgot-password.module';
import { PublicModule } from './public/public.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { UserAppDeviceModule } from './user-app-device/user-app-device.module';
import { BreathingExercisePrescriptionModule } from './breathing-exercise-prescription/breathing-exercise-prescription.module';
import { UserNotificationModule } from './user-notification/user-notification.module';
import { EventNotificationModule } from './event-notification/event-notification.module';
import { NotificationReminderModule } from './notification-reminder/notification-reminder.module';
import { PatientRecordsModule } from './patient-records/patient-records.module';
import { DataServerModule } from './data-server/data-server.module';
import { OrganizationModule } from './organization/organization.module';
import { TrendsSettingsModule } from './trends-settings/trends-settings.module';
import { MedicalAlertsModule } from './medical-alerts/medical-alerts.module';
import { NonMedicalNotificationModule } from './non-medical-notification/non-medical-notification.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ClinicianNoteModule,
    PatientNoteModule,
    PatientHealthInputModule,
    CalendarModule,
    PatientAlertSettingsModule,
    PatientSymptomsInputModule,
    PatientBreathingInputModule,
    AppointmentModule,
    MedicationPrescriptionModule,
    PatientMedicationInputModule,
    SensorModule,
    GatewayModule,
    MessageModule,
    ForgotPasswordModule,
    PublicModule,
    FileUploadModule,
    UserAppDeviceModule,
    BreathingExercisePrescriptionModule,
    UserNotificationModule,
    EventNotificationModule,
    NotificationReminderModule,
    PatientRecordsModule,
    DataServerModule,
    OrganizationModule,
    TrendsSettingsModule,
    MedicalAlertsModule,
    NonMedicalNotificationModule,
    SymptomsQuestionnaireModule,
  ],
})
export class IndexRouteModule {}
