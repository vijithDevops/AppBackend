import { PatientAlertModule } from './../../../services/patient-alerts/patient-alert.module';
import { PatientAlertSettingsModelModule } from 'src/models/patient_alert_settings/patient_alert_settings.model.module';
import { CalendarModelModule } from './../../../models/calendar/calendar.model.module';
import { PatientQuestionnaireInputModelModule } from './../../../models/patient_questionnaire_input/patient_questionnaire_input.model.module';
import { UserModelModule } from './../../../models/user/user.model.module';
import { OrganizationModelModule } from './../../../models/organization/organization.model.module';
import { OrganizationModule } from './../organization/organization.module';
import { SymptomsQuestionnnaireModelModule } from './../../../models/symptoms-questionnaire/symptoms_questionnaire.model.module';
import { Module } from '@nestjs/common';
import { SymptomsQuestionnaireController } from './symptoms-questionnaire.controller';
import { SymptomsQuestionnnaireService } from './symptoms-questionnaire.service';

@Module({
  imports: [
    SymptomsQuestionnnaireModelModule,
    OrganizationModule,
    OrganizationModelModule,
    UserModelModule,
    CalendarModelModule,
    PatientQuestionnaireInputModelModule,
    PatientAlertSettingsModelModule,
    PatientAlertModule,
  ],
  controllers: [SymptomsQuestionnaireController],
  providers: [SymptomsQuestionnnaireService],
  exports: [SymptomsQuestionnnaireService],
})
export class SymptomsQuestionnaireModule {}
