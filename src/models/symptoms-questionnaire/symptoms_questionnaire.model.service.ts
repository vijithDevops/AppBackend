import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationQuestionnaireMapping } from './entity/organization_questionnaire_mapping.entity';
import { OrganizationSymptomsQuestionnaires } from './entity/organization_questionnaires.view.entity';
import { SymptomsQuestionnnaire } from './entity/symptoms_questionnaire.entity';
import {
  ICreateOrganizationQuestionnaireMapping,
  ICreateSymptomsQuestionnaire,
  IUpdateOrganizationQuestionnaire,
} from './interfaces';

@Injectable()
export class SymptomsQuestionnnaireModelService {
  constructor(
    @InjectRepository(SymptomsQuestionnnaire)
    private symptomsQuestionnnaireRepository: Repository<SymptomsQuestionnnaire>,
    @InjectRepository(OrganizationQuestionnaireMapping)
    private organizationQuestionnaireMappingRepository: Repository<OrganizationQuestionnaireMapping>,
    @InjectRepository(OrganizationSymptomsQuestionnaires)
    private organizationSymptomsQuestionnairesRepository: Repository<OrganizationSymptomsQuestionnaires>,
  ) {}

  async createQuestionnaire(dto: ICreateSymptomsQuestionnaire) {
    return await this.symptomsQuestionnnaireRepository.save(dto);
  }

  async createOrganizationQuestionnaireMapping(
    dto: ICreateOrganizationQuestionnaireMapping,
  ) {
    return await this.organizationQuestionnaireMappingRepository.save(dto);
  }

  async getOrganizationSymptomsQuestionnairs(filters: {
    organizationId: string;
    isActive?: boolean;
  }): Promise<OrganizationSymptomsQuestionnaires[]> {
    const query = this.organizationSymptomsQuestionnairesRepository
      .createQueryBuilder('organizationQuestionnair')
      .where('organizationQuestionnair.organizationId = :organizationId', {
        organizationId: filters.organizationId,
      })
      .orderBy('organizationQuestionnair.order', 'ASC')
      .addOrderBy('organizationQuestionnair.createdAt', 'ASC');
    if (filters.isActive !== undefined) {
      query.andWhere('organizationQuestionnair.isActive =:isActive', {
        isActive: filters.isActive,
      });
    }
    return await query.getMany();
  }

  async getOrganizationSymptomsQuestionnaireById(
    questionnaireId: string,
    organizationId?: string,
  ): Promise<OrganizationSymptomsQuestionnaires> {
    const query = this.organizationSymptomsQuestionnairesRepository
      .createQueryBuilder('organizationQuestionnaire')
      .where('organizationQuestionnaire.id = :questionnaireId', {
        questionnaireId,
      });
    if (organizationId) {
      query.andWhere(
        'organizationQuestionnaire.organizationId =:organizationId',
        { organizationId },
      );
    }
    return await query.getOne();
  }

  async getSymptomsQuestionnaire(
    id: string,
    organizationId: string,
  ): Promise<SymptomsQuestionnnaire> {
    return await this.symptomsQuestionnnaireRepository
      .createQueryBuilder('questionnaire')
      .where('questionnaire.id = :id', {
        id,
      })
      .leftJoinAndSelect(
        'questionnaire.organizationQuestionnaireMapping',
        'organizationQuestionnaireMapping',
        'organizationQuestionnaireMapping.organizationId =:organizationId',
        { organizationId },
      )
      .getOne();
  }

  async softDeleteOrganizationQuestionnaire(id: string): Promise<void> {
    await this.symptomsQuestionnnaireRepository.softDelete(id);
  }

  async updateSymptomsQuestionnaire(
    id: string,
    dto: IUpdateOrganizationQuestionnaire,
  ) {
    try {
      return await this.symptomsQuestionnnaireRepository
        .createQueryBuilder('questionnaire')
        .update()
        .set({ ...dto })
        .where('id = :id AND isDefault = false', { id })
        .execute();
    } catch (error) {
      throw error;
    }
  }

  async getOrganizationQuestionnaireDefaultMapping(
    questionnaireId: string,
    organizationId: string,
  ) {
    try {
      const symptomsQuestionnaire = await this.symptomsQuestionnnaireRepository
        .createQueryBuilder('questionnaire')
        .where(
          'questionnaire.id = :questionnaireId AND questionnaire.isDefault = true',
          {
            questionnaireId,
          },
        )
        .leftJoinAndMapOne(
          'questionnaire.organizationQuestionnaireMapping',
          OrganizationQuestionnaireMapping,
          'organizationQuestionnaireMapping',
          'organizationQuestionnaireMapping.questionnaireId = questionnaire.id AND organizationQuestionnaireMapping.organizationId =:organizationId',
          { organizationId },
        )
        .getOne();
      return symptomsQuestionnaire &&
        symptomsQuestionnaire.organizationQuestionnaireMapping
        ? symptomsQuestionnaire.organizationQuestionnaireMapping
        : null;
    } catch (error) {
      throw error;
    }
  }

  async updateOrganizationQuestionnaireMapping(
    questionnaireId: string,
    organizationId: string,
    dto: IUpdateOrganizationQuestionnaire,
  ) {
    try {
      return await this.organizationQuestionnaireMappingRepository
        .createQueryBuilder('questionnaireMapping')
        .update()
        .set({ ...dto })
        .where(
          'questionnaireId = :questionnaireId AND organizationId = :organizationId',
          { questionnaireId, organizationId },
        )
        .execute();
    } catch (error) {
      throw error;
    }
  }
}
