import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientQuestionnaireInputs } from './entity/patient_questionnaire_inputs.entity';
import { PatientQuestionnaireInputMaster } from './entity/patient_questionnaire_input_master.entity';
import { PatientQuestionnaireInputModelService } from './patient_questionnaire_input.model.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientQuestionnaireInputMaster,
      PatientQuestionnaireInputs,
    ]),
  ],
  providers: [PatientQuestionnaireInputModelService],
  exports: [PatientQuestionnaireInputModelService],
})
export class PatientQuestionnaireInputModelModule {}
