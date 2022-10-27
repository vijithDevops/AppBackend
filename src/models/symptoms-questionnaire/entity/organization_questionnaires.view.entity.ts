import { Organization } from 'src/models/organization/entity/organization.entity';
import { OrganizationType } from '../../organization/entity/organization.enum';
import { ViewEntity, ViewColumn, ManyToOne, JoinColumn } from 'typeorm';
import { QuestionnaireType } from './symptoms-questionnaire.enum';

@ViewEntity({
  name: 'organization_symptoms_questionnaires',
  expression: `
      (
        SELECT
          default_questionnaire.id                                AS  id,
          CASE  
            WHEN  questionnaire_mapping.question IS NOT NULL
                THEN  questionnaire_mapping.question
                ELSE  default_questionnaire.question
            END                                                   AS  question,
          CASE  
            WHEN  questionnaire_mapping.keyword IS NOT NULL
                THEN  questionnaire_mapping.keyword
                ELSE  default_questionnaire.keyword
            END                                                   AS  keyword,
          CASE  
            WHEN  questionnaire_mapping.scale IS NOT NULL
                THEN  questionnaire_mapping.scale
                ELSE  default_questionnaire.scale
            END                                                   AS  scale,
          CASE  
            WHEN  questionnaire_mapping.type IS NOT NULL
                THEN  questionnaire_mapping.type
                ELSE  default_questionnaire.type
            END                                                   AS  type,
          CASE  
            WHEN  questionnaire_mapping.is_active IS NOT NULL
                THEN  questionnaire_mapping.is_active
                ELSE  default_questionnaire.is_active
            END                                                   AS  is_active,
          CASE  
            WHEN  questionnaire_mapping.order IS NOT NULL
                THEN  questionnaire_mapping.order
                ELSE  default_questionnaire.order
            END                                                   AS  order,
          default_questionnaire.is_default                        AS  is_default,
          organization.id                                         AS  organization_id,
          default_questionnaire.created_at                        AS  created_at,
          CASE  
            WHEN  questionnaire_mapping.updated_at IS NOT NULL
                THEN  questionnaire_mapping.updated_at
                ELSE  default_questionnaire.updated_at
            END                                                   AS  updated_at
        FROM "symptoms_questionnaire" default_questionnaire
          LEFT JOIN "organization" organization
              ON
              organization.type = '${OrganizationType.HOSPITAL}' AND 
              organization.deleted_at IS NULL
          LEFT JOIN "organization_questionnaire_mapping" questionnaire_mapping
              ON  
                questionnaire_mapping.questionnaire_id = default_questionnaire.id AND
                questionnaire_mapping.organization_id = organization.id
        WHERE default_questionnaire.is_default = true AND default_questionnaire.deleted_at IS NULL
      )
      UNION
      (
        SELECT
            questionnaire.id                                AS  id,
            questionnaire.question                          AS  question,
            questionnaire.keyword                           AS  keyword,
            questionnaire.scale                             AS  scale,
            questionnaire.type                              AS  type,
            questionnaire.is_active                         AS  is_active,
            questionnaire.order                             AS  order,
            questionnaire.is_default                        AS  is_default,
            questionnaire_mapping.organization_id           AS  organization_id,
            questionnaire.created_at                        AS  created_at,
            questionnaire.updated_at                        AS  updated_at
        FROM "symptoms_questionnaire"  questionnaire
        INNER JOIN "organization_questionnaire_mapping" questionnaire_mapping
              ON  
                questionnaire_mapping.questionnaire_id = questionnaire.id
        WHERE 
        questionnaire.is_default = false AND
        questionnaire.deleted_at IS NULL
      )
    `,
})
export class OrganizationSymptomsQuestionnaires {
  @ViewColumn()
  id: string;

  @ViewColumn()
  question: string;

  @ViewColumn()
  keyword: string;

  @ViewColumn()
  scale: string[];

  @ViewColumn()
  type: QuestionnaireType;

  @ViewColumn({ name: 'is_active' })
  isActive: boolean;

  @ViewColumn({ name: 'order' })
  order?: number;

  @ViewColumn({ name: 'is_default' })
  isDefault: boolean;

  @ViewColumn({ name: 'organization_id' })
  organizationId: string;
  @ManyToOne(
    () => Organization,
    (organization) => organization.symptomsQuestionnaires,
  )
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ViewColumn({ name: 'created_at' })
  createdAt: Date;

  @ViewColumn({ name: 'updated_at' })
  updatedAt: Date;
}
