import { QuestionnaireType } from '../entity/symptoms-questionnaire.enum';

export interface ICreateSymptomsQuestionnaire {
  question: string;
  keyword: string;
  isActive: boolean;
  isDefault: boolean;
  type?: QuestionnaireType;
  scale: string[];
}

export interface ICreateOrganizationQuestionnaireMapping {
  organizationId: string;
  questionnaireId: string;
  question?: string;
  keyword?: string;
  isActive?: boolean;
  type?: QuestionnaireType;
  scale?: string[];
}
