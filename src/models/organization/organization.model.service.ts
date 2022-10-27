import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entity/organization.entity';
import { OrganizationType } from './entity/organization.enum';
import {
  ICreateOrganization,
  IFindAllOrganizations,
  IFindPublicOrganizationOptions,
  IUpdateOrganization,
} from './interfaces';

@Injectable()
export class OrganizationModelService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async create(createOrganization: ICreateOrganization): Promise<Organization> {
    return await this.organizationRepository.save({
      ...createOrganization,
      type: OrganizationType.HOSPITAL,
    });
  }

  async update(updateOrganization: IUpdateOrganization): Promise<Organization> {
    return await this.organizationRepository.save(updateOrganization);
  }

  async updateCacheUpdateSchedulerId(
    organizationId: string,
    schedulerId: string,
  ) {
    return await this.organizationRepository
      .createQueryBuilder()
      .update()
      .set({ cacheUpdateSchedulerId: schedulerId })
      .where('id = :organizationId', { organizationId })
      .execute()
      .catch((err) => {
        throw err;
      });
  }

  async remove(id: string): Promise<void> {
    await this.organizationRepository.delete(id);
  }

  async findAllOrganizationsPaginated(options: IFindAllOrganizations) {
    const query = this.organizationRepository
      .createQueryBuilder('organization')
      .leftJoinAndSelect(
        'organization.organizationSettings',
        'organizationSettings',
      )
      .offset(options.skip)
      .limit(options.limit)
      .orderBy('organization.createdAt', options.sort);
    if (options.types && options.types.length > 0) {
      query.andWhere('organization.type IN (:...types)', {
        types: options.types,
      });
    }
    if (options.search) {
      query.andWhere('organization.name ILIKE :name', {
        name: `%${options.search}%`,
      });
    }
    const [data, count] = await query.getManyAndCount();
    return { data, totalCount: count };
  }

  async findPublicOrganizationListPaginated(
    options: IFindPublicOrganizationOptions,
  ) {
    const query = this.organizationRepository
      .createQueryBuilder('organization')
      .select(['organization.id', 'organization.name', 'organization.type'])
      .leftJoin('organization.organizationSettings', 'organizationSettings')
      .addSelect(['organizationSettings.clinicalTrial'])
      .offset(options.skip)
      .limit(options.limit)
      .orderBy('organization.name', 'ASC');
    if (options.types && options.types.length > 0) {
      query.andWhere('organization.type IN (:...types)', {
        types: options.types,
      });
    }
    if (options.search) {
      query.andWhere('organization.name ILIKE :name', {
        name: `%${options.search}%`,
      });
    }
    const [data, count] = await query.getManyAndCount();
    return { data, totalCount: count };
  }

  async findOne(id: string): Promise<Organization> {
    return await this.organizationRepository.findOne(id, {
      relations: ['organizationSettings'],
    });
  }

  async findOneByAccessCode(accessCode: string): Promise<Organization> {
    const organization = await this.organizationRepository
      .createQueryBuilder('organization')
      .innerJoinAndSelect(
        'organization.organizationSettings',
        'organizationSettings',
        'organizationSettings.accessCode =:accessCode',
        { accessCode },
      )
      .andWhere('organization.type =:type', { type: OrganizationType.HOSPITAL })
      .getOne();
    if (!organization) {
      throw new Error('Invalid access code');
    }
    return organization;
  }

  async getOrganizationByCacheUpdateSchedulerId(
    schedulerId: string,
  ): Promise<Organization> {
    return await this.organizationRepository
      .createQueryBuilder('organization')
      .where('organization.cacheUpdateSchedulerId =:schedulerId', {
        schedulerId,
      })
      .andWhere('organization.type =:type', { type: OrganizationType.HOSPITAL })
      .getOne();
  }

  async findOneByAuthTokenAndAccessCode(
    authToken: string,
    accessCode: string,
  ): Promise<Organization> {
    const organization = await this.organizationRepository
      .createQueryBuilder('organization')
      .innerJoinAndSelect(
        'organization.organizationSettings',
        'organizationSettings',
        'organizationSettings.authToken =:authToken AND organizationSettings.accessCode =:accessCode',
        { authToken, accessCode },
      )
      .andWhere('organization.type =:type', { type: OrganizationType.HOSPITAL })
      .getOne();
    return organization;
  }

  async findOneById(id: string): Promise<Organization> {
    return await this.organizationRepository.findOne({
      where: { id },
      relations: ['organizationSettings'],
    });
  }

  async getAdminOrganization(): Promise<Organization> {
    return await this.organizationRepository.findOne({
      where: { type: OrganizationType.RESPIREE },
    });
  }

  async findOneByName(name: string): Promise<Organization> {
    return await this.organizationRepository.findOne({
      name: name,
    });
  }

  async findAllOrganizations(): Promise<Organization[]> {
    return await this.organizationRepository.find({
      select: ['id', 'name', 'timezone'],
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.organizationRepository.softDelete(id);
  }
}
