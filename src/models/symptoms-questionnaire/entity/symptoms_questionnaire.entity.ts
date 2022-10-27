import { PatientQuestionnaireInputs } from 'src/models/patient_questionnaire_input/entity/patient_questionnaire_inputs.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { OrganizationQuestionnaireMapping } from './organization_questionnaire_mapping.entity';
import { QuestionnaireType } from './symptoms-questionnaire.enum';

@Entity('symptoms_questionnaire')
export class SymptomsQuestionnnaire {
  @PrimaryGeneratedColumn('uuid')
  @Index('symptoms_questionnaire_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'question', type: 'text' })
  question: string;

  @Column({ name: 'keyword', type: 'varchar' })
  keyword: string;

  @Column({ type: 'varchar', default: QuestionnaireType.DROPDOWN })
  type: QuestionnaireType;

  @Column({ name: 'is_default', type: 'boolean', default: 0 })
  isDefault: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: 1 })
  isActive: boolean;

  @Column({ name: 'scale', type: 'varchar', array: true })
  scale: string[];

  @Column({ name: 'order', type: 'integer', nullable: true })
  order?: number;

  @OneToMany(
    () => OrganizationQuestionnaireMapping,
    (organizationQuestionnaireMapping) =>
      organizationQuestionnaireMapping.questionnaire,
  )
  organizationQuestionnaireMapping: OrganizationQuestionnaireMapping[];

  @OneToMany(
    () => PatientQuestionnaireInputs,
    (patientQuestionnaireInputs) => patientQuestionnaireInputs.questionnaire,
  )
  patientQuestionnaireInputs: PatientQuestionnaireInputs[];

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
