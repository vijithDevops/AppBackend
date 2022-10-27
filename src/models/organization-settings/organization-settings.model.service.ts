import { Organization } from 'src/models/organization/entity/organization.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogService } from 'src/services/logger/logger.service';
import { Repository } from 'typeorm';
import { OrganizationSettings } from './entity/organization-settings.entity';
import {
  ICreateOrganziationSettings,
  IUpdateOrganziationSettings,
} from './interfaces';

@Injectable()
export class OrganizationSettingsModelService {
  constructor(
    private logService: LogService,
    @InjectRepository(OrganizationSettings)
    private organizationSettingsRepository: Repository<OrganizationSettings>,
  ) {}

  async create(
    organization: Organization,
    createDto: ICreateOrganziationSettings = {},
  ): Promise<OrganizationSettings> {
    if (!createDto.accessCode) {
      // set default access key as organization name
      createDto['accessCode'] = organization.name.replace(/ /g, '');
    }
    return await this.organizationSettingsRepository
      .save({ organizationId: organization.id, ...createDto })
      .catch((err) => {
        throw err;
      });
  }

  async updateByOrganizationId(
    organizationId: string,
    updateDto: IUpdateOrganziationSettings,
  ) {
    return this.organizationSettingsRepository
      .createQueryBuilder()
      .update()
      .set({ ...updateDto })
      .where('organizationId =:organizationId', { organizationId })
      .execute()
      .catch((err) => {
        this.logService.logError('Error updating organization settings', err);
      });
  }

  async findByOrganization(
    organization: Organization,
  ): Promise<OrganizationSettings> {
    const settings = await this.organizationSettingsRepository.findOne({
      where: {
        organizationId: organization.id,
      },
    });
    if (!settings) {
      return await this.create(organization);
    }
    return settings;
  }

  async isAccessCodeExist(
    accessCode: string,
    excludeOrganizationId?: string[],
  ): Promise<boolean> {
    const query = this.organizationSettingsRepository
      .createQueryBuilder('organizationSettings')
      .where('organizationSettings.accessCode =:accessCode', { accessCode });
    if (excludeOrganizationId) {
      query.andWhere(
        'organizationSettings.organizationId NOT IN (:...excludeOrganizationId)',
        { excludeOrganizationId },
      );
    }
    return !!(await query.getCount());
  }

  async getOrganizationByAccessCode(accessCode: string): Promise<Organization> {
    const orgSettings = await this.organizationSettingsRepository.findOne({
      where: {
        accessCode,
      },
      relations: ['organization'],
    });
    if (!orgSettings) {
      throw new Error('Invalid access code');
    }
    orgSettings.organization.organizationSettings = orgSettings;
    return orgSettings.organization;
  }
}
