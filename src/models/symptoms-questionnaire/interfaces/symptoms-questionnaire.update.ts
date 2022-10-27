import { QuestionnaireType } from 'src/models/symptoms-questionnaire/entity/symptoms-questionnaire.enum';
export interface IUpdateOrganizationQuestionnaire {
  question?: string;
  keyword?: string;
  isActive?: boolean;
  type?: QuestionnaireType;
  scale?: string[];
}
