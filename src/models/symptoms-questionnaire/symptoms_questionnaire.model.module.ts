import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationQuestionnaireMapping } from './entity/organization_questionnaire_mapping.entity';
import { OrganizationSymptomsQuestionnaires } from './entity/organization_questionnaires.view.entity';
import { SymptomsQuestionnnaire } from './entity/symptoms_questionnaire.entity';
import { SymptomsQuestionnnaireModelService } from './symptoms_questionnaire.model.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SymptomsQuestionnnaire,
      OrganizationQuestionnaireMapping,
      OrganizationSymptomsQuestionnaires,
    ]),
  ],
  providers: [SymptomsQuestionnnaireModelService],
  exports: [SymptomsQuestionnnaireModelService],
})
export class SymptomsQuestionnnaireModelModule {}
