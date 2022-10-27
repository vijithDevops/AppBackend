import { SymptomsQuestionnnaire } from 'src/models/symptoms-questionnaire/entity/symptoms_questionnaire.entity';
import { QuestionnaireType } from 'src/models/symptoms-questionnaire/entity/symptoms-questionnaire.enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PatientQuestionnaireInputMaster } from './patient_questionnaire_input_master.entity';

@Entity('patient_questionnaire_inputs')
export class PatientQuestionnaireInputs {
  @PrimaryGeneratedColumn('uuid')
  @Index('patient_questionnaire_inputs_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'input_master_id' })
  inputMasterId: string;
  @ManyToOne(
    () => PatientQuestionnaireInputMaster,
    (patientSymptomsInputMaster) => patientSymptomsInputMaster.patientInputs,
  )
  @JoinColumn({ name: 'input_master_id' })
  patientQuestionnaireInputMaster: PatientQuestionnaireInputMaster;

  @Column({ name: 'questionnaire_id' })
  questionnaireId: string;
  @ManyToOne(
    () => SymptomsQuestionnnaire,
    (symptomsQuestionnnaire) =>
      symptomsQuestionnnaire.patientQuestionnaireInputs,
  )
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: SymptomsQuestionnnaire;

  @Column({ name: 'input', type: 'integer' })
  input: number;

  @Column({ name: 'question', type: 'text' })
  question: string;

  @Column({ name: 'keyword', type: 'varchar' })
  keyword: string;

  @Column({ type: 'varchar' })
  type: QuestionnaireType;

  @Column({ name: 'scale', type: 'varchar', array: true })
  scale: string[];

  @Column({ name: 'order', type: 'integer', nullable: true })
  order?: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp without time zone',
    select: false,
  })
  updatedAt?: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamp without time zone',
    select: false,
  })
  deletedAt?: Date;
}
