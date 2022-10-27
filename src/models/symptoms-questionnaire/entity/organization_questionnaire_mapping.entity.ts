import { Organization } from '../../organization/entity/organization.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SymptomsQuestionnnaire } from './symptoms_questionnaire.entity';
import { QuestionnaireType } from './symptoms-questionnaire.enum';

@Entity('organization_questionnaire_mapping')
@Unique(['organizationId', 'questionnaire'])
export class OrganizationQuestionnaireMapping {
  @PrimaryGeneratedColumn('uuid')
  @Index('organization_questionnaire_mapping_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;
  @ManyToOne(
    () => Organization,
    (organization) => organization.organizationQuestionnaireMapping,
  )
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'questionnaire_id' })
  questionnaireId: string;
  @ManyToOne(
    () => SymptomsQuestionnnaire,
    (symptomsQuestionnnaire) =>
      symptomsQuestionnnaire.organizationQuestionnaireMapping,
  )
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: SymptomsQuestionnnaire;

  @Column({ name: 'question', type: 'text', nullable: true })
  question?: string;

  @Column({ type: 'varchar', nullable: true })
  type?: QuestionnaireType;

  @Column({ name: 'keyword', type: 'varchar', nullable: true })
  keyword?: string;

  @Column({ name: 'is_active', type: 'boolean', nullable: true })
  isActive?: boolean;

  @Column({ name: 'scale', type: 'varchar', array: true, nullable: true })
  scale?: string[];

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
}
