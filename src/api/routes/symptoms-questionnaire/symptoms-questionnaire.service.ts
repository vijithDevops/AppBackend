import { PatientAlertService } from './../../../services/patient-alerts/patient-alert.service';
import { PatientAlertSettingsModelService } from './../../../models/patient_alert_settings/patient_alert_settings.model.service';
import { QuestionnaireType } from 'src/models/symptoms-questionnaire/entity/symptoms-questionnaire.enum';
import { User } from 'src/models/user/entity/user.entity';
import { SymptomsQuestionnnaireModelService } from './../../../models/symptoms-questionnaire/symptoms_questionnaire.model.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { LogService } from 'src/services/logger/logger.service';
import { SymptomsQuestionnnaire } from 'src/models/symptoms-questionnaire/entity/symptoms_questionnaire.entity';
import {
  PatientQuestionnaireInput,
  UpdateSymptomsQustionnaireDto,
} from './dto';
import { OrganizationSymptomsQuestionnaires } from 'src/models/symptoms-questionnaire/entity/organization_questionnaires.view.entity';
import {
  ALERT_TYPE,
  APP_SERVER_PATIENT_ALERTS,
} from 'src/config/master-data-constants';

@Injectable()
export class SymptomsQuestionnnaireService {
  constructor(
    private readonly symptomsQuestionnnaireModelService: SymptomsQuestionnnaireModelService,
    private readonly patientAlertSettingsModelService: PatientAlertSettingsModelService,
    private readonly patientAlertService: PatientAlertService,
    private logService: LogService,
  ) {}

  async validateAndGetOrganizationQuestionnair(
    questionnaireId: string,
    organizationId: string,
  ): Promise<SymptomsQuestionnnaire> {
    try {
      const questionnaire = await this.symptomsQuestionnnaireModelService.getSymptomsQuestionnaire(
        questionnaireId,
        organizationId,
      );
      if (!questionnaire) {
        throw new BadRequestException('Invalid symptoms questionnaire');
      }
      return questionnaire;
    } catch (error) {
      throw error;
    }
  }

  async updateDefaultQuestionnaireOfOrganization(
    questionnaireId: string,
    organizationId: string,
    dto: UpdateSymptomsQustionnaireDto,
  ) {
    try {
      const defaultMapping = await this.symptomsQuestionnnaireModelService.getOrganizationQuestionnaireDefaultMapping(
        questionnaireId,
        organizationId,
      );
      if (defaultMapping) {
        await this.symptomsQuestionnnaireModelService.updateOrganizationQuestionnaireMapping(
          questionnaireId,
          organizationId,
          dto,
        );
      } else {
        await this.symptomsQuestionnnaireModelService.createOrganizationQuestionnaireMapping(
          {
            questionnaireId,
            organizationId,
            ...dto,
          },
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async validatePatientInputsDtoAndGetInputObject(
    inputs: PatientQuestionnaireInput[],
    patient: User,
  ): Promise<{
    inputs: {
      input: number;
      questionnaireId: string;
      question: string;
      keyword: string;
      scale: string[];
      type: QuestionnaireType;
      order?: number;
    }[];
    totalScore: number;
  }> {
    try {
      const questionObjecs = await this.getOrganizationSymptomsQuestionsMaps(
        patient.organizationId,
      );
      let totalScore = 0;
      const inputMaps = inputs.map((input, index) => {
        if (!questionObjecs[input.questionId]) {
          throw new BadRequestException('Invalid Symptom Question');
        }
        const question: OrganizationSymptomsQuestionnaires =
          questionObjecs[input.questionId];
        if (input.value > question.scale.length) {
          throw new BadRequestException(
            'Input value must match the question scale length',
          );
        }
        totalScore = totalScore + input.value;
        return {
          input: input.value,
          questionnaireId: question.id,
          question: question.question,
          keyword: question.keyword,
          scale: question.scale,
          type: question.type,
          order: index + 1,
        };
      });
      return { inputs: inputMaps, totalScore };
    } catch (error) {
      throw error;
    }
  }

  async getOrganizationSymptomsQuestionsMaps(
    organizationId: string,
  ): Promise<{ [key: string]: OrganizationSymptomsQuestionnaires }> {
    try {
      const questions = await this.symptomsQuestionnnaireModelService.getOrganizationSymptomsQuestionnairs(
        {
          organizationId: organizationId,
          isActive: true,
        },
      );
      const questionObjecs = {};
      questions.forEach((question) => {
        questionObjecs[question.id] = question;
      });
      return questionObjecs;
    } catch (error) {
      throw error;
    }
  }

  async SendPatientAlertForSymptomsScore(score: number, patient: User) {
    const alertSettings = await this.patientAlertSettingsModelService.findByPatientId(
      patient.id,
    );
    if (alertSettings.symptomsScoreApplicability) {
      const amberValue = alertSettings.symptomsScoreAmber;
      const redValue = alertSettings.symptomsScoreRed;
      if (score >= redValue) {
        this.patientAlertService.sendAlertNotificationToPatientAndSupervisors(
          patient,
          ALERT_TYPE.RED_ALERT,
          APP_SERVER_PATIENT_ALERTS.SYMPTOMS_SCORE,
        );
      } else if (score >= amberValue) {
        this.patientAlertService.sendAlertNotificationToPatientAndSupervisors(
          patient,
          ALERT_TYPE.AMBER_ALERT,
          APP_SERVER_PATIENT_ALERTS.SYMPTOMS_SCORE,
        );
      }
    }
  }
}
