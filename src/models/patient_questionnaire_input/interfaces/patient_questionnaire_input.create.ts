export class ICreateQuestionnaireInputMaster {
  patientId: string;
  calendarId: string;
  totalScore: number;
}

export class ICreatePatientInput {
  inputMasterId: string;
  input: number;
  questionnaireId: string;
  question: string;
  keyword: string;
  scale: string[];
  order?: number;
}
