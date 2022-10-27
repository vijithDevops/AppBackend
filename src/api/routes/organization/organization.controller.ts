import { NotificationReminderService } from './../notification-reminder/notification-reminder.service';
import { Organization } from './../../../models/organization/entity/organization.entity';
import {
  UseGuards,
  Controller,
  Post,
  Get,
  Delete,
  Request,
  Put,
  Query,
  Param,
  Body,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiParam,
  ApiOperation,
} from '@nestjs/swagger';
import { OrganizationSettingsModelService } from './../../../models/organization-settings/organization-settings.model.service';
import { OrganizationModelService } from '../../../models/organization/organization.model.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../../common/guards/organization.guard';
import { RolesGuard } from '../../../common/guards/role.guard';
import { Role } from '../../../models/user/entity/user.enum';
import { Roles } from '../../../common/decorators/role.decorator';
import { getPagination } from '../../../common/utils/entity_metadata';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationListPaginated,
  UpdateOrganizationSettingsDto,
} from './dto/';
import { OrganizationType } from 'src/models/organization/entity/organization.enum';
import { OrganizationSettings } from 'src/models/organization-settings/entity/organization-settings.entity';
import { OrganizationService } from './organization.service';

@Controller('organization')
@ApiBearerAuth()
@ApiTags('Organization')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly organizationModelService: OrganizationModelService,
    private readonly notificationReminderService: NotificationReminderService,
    private readonly organizationSettingsModelService: OrganizationSettingsModelService,
  ) {}

  @ApiOperation({
    description: 'API to add new organization',
  })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/')
  async createOrganization(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    try {
      if (
        await this.organizationSettingsModelService.isAccessCodeExist(
          createOrganizationDto.name.replace(/ /g, ''),
        )
      ) {
        throw new BadRequestException(
          'Failed to create organization with this name. Please use a different one',
        );
      }
      const organization = await this.organizationModelService
        .create(createOrganizationDto)
        .catch((err) => {
          throw this.organizationService.handleCreateOrganizationErrorMessage(
            err,
          );
        });
      const organizationSettings = await this.organizationSettingsModelService
        .create(organization)
        .catch(async () => {
          await this.organizationModelService.remove(organization.id);
          throw new BadRequestException('Failed to create Organization');
        });
      if (organization.timezone) {
        this.notificationReminderService.scheduleDefaultRemindesForOrganziation(
          organization,
        );
        this.organizationService.schedulePatientCacheUpdateEvent(organization);
      }
      organization.organizationSettings = organizationSettings;
      return organization;
    } catch (err) {
      throw err;
    }
  }

  @ApiOperation({
    description: 'API to update an organization',
  })
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
  @ApiParam({ name: 'id', type: String, required: true })
  @Put('/:id')
  async updateOrganization(
    @Request() req,
    @Param() params,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const organization = await this.organizationModelService.findOne(params.id);
    if (!organization) {
      throw new BadRequestException('Invalid organization Id');
    }
    const data = {
      id: params.id,
      ...updateOrganizationDto,
    };
    const updateData = await this.organizationModelService
      .update(data)
      .catch((err) => {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      });
    const updatedOrganziationData = await this.organizationModelService.findOne(
      organization.id,
    );
    if (updateOrganizationDto.timezone) {
      // update default reminder
      if (
        !organization.timezone ||
        updateOrganizationDto.timezone !== organization.timezone
      ) {
        this.organizationService.updateSchedledEventsOfOrganizationOnTimezoneUpdate(
          updatedOrganziationData,
        );
        // if (organization.timezone) {
        //   //delete existing reminder
        //   await Promise.all([
        //     this.notificationReminderService.deleteOrganizationDefaultReminders(
        //       updatedOrganziationData,
        //     ),
        //     this.organizationService.deleteScheduledPatientCacheUpdateEvent(
        //       organization,
        //     ),
        //   ]);
        // }
        // this.notificationReminderService.scheduleDefaultRemindesForOrganziation(
        //   updatedOrganziationData,
        // );
        // this.organizationService.schedulePatientCacheUpdateEvent(organization);
      }
    }
    return updatedOrganziationData;
  }

  @ApiOperation({
    description: 'API to list all organizations',
  })
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/')
  async getAllOrganizationPaginated(
    @Request() req,
    @Query() queryParams: OrganizationListPaginated,
  ) {
    const { sort, search, ...paginateParams } = queryParams;
    const { skip, limit } = getPagination(paginateParams);
    return await this.organizationModelService.findAllOrganizationsPaginated({
      skip,
      limit,
      sort,
      search,
      types: [OrganizationType.HOSPITAL],
    });
  }

  @UseGuards(JwtAuthGuard, OrganizationGuard)
  @Get('/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async getOrganization(@Param() params): Promise<Organization> {
    return await this.organizationModelService.findOne(params.id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/reset/default-reminders')
  async fixOrganizationDefaultReminders(): Promise<void> {
    const organziations = await this.organizationModelService.findAllOrganizations();
    await this.notificationReminderService.resetAllOrganizationDefaultReminders(
      organziations,
    );
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/reset/update-cache-event')
  async fixUpdateCacheEvent(): Promise<void> {
    const organziations = await this.organizationModelService.findAllOrganizations();
    await this.organizationService.resetAllOrganizationsUpdateCacheEvent(
      organziations,
    );
  }

  @ApiOperation({
    description: 'API to delete an organization',
  })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
  @Delete('/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async deleteOrganization(@Param() params): Promise<void> {
    const organization = await this.organizationModelService
      .findOne(params.id)
      .catch(() => {
        throw new HttpException(
          'Invalid organization id',
          HttpStatus.BAD_REQUEST,
        );
      });
    if (organization.type === OrganizationType.RESPIREE) {
      throw new UnauthorizedException();
    }
    return await this.organizationModelService
      .softDelete(params.id)
      .catch((err) => {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      });
  }

  @ApiOperation({
    description: 'API to update an organization settings',
  })
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
  @ApiParam({ name: 'organizationId', type: String, required: true })
  @Patch('/settings/:organizationId')
  async updateOrganizationSettings(
    @Param() params,
    @Body() updateOrganizationSettingsDto: UpdateOrganizationSettingsDto,
  ): Promise<OrganizationSettings> {
    const organization = await this.organizationService.validateOrganization(
      params.organizationId,
    );
    if (organization.type !== OrganizationType.HOSPITAL) {
      throw new BadRequestException(
        'failed to update settings for the organziation',
      );
    }
    if (updateOrganizationSettingsDto.apiEnabled) {
      this.organizationService.validateApiEnabledUrls(
        updateOrganizationSettingsDto.clientUrl,
        updateOrganizationSettingsDto.dataStoreUrl,
      );
      if (!updateOrganizationSettingsDto.authToken) {
        throw new BadRequestException('auth token is required');
      }
    }
    if (
      updateOrganizationSettingsDto.accessCode &&
      (await this.organizationSettingsModelService.isAccessCodeExist(
        updateOrganizationSettingsDto.accessCode,
        [organization.id],
      ))
    ) {
      throw new BadRequestException('Access code already used');
    }
    if (!organization.organizationSettings) {
      //create organization settings
      await this.organizationSettingsModelService.create(organization, {
        ...updateOrganizationSettingsDto,
      });
    } else {
      const updateDto = {
        ...organization.organizationSettings,
        ...updateOrganizationSettingsDto,
      };
      await this.organizationSettingsModelService.updateByOrganizationId(
        organization.id,
        updateDto,
      );
    }
    return await this.organizationSettingsModelService.findByOrganization(
      organization,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationGuard)
  @Get('/settings/:organizationId')
  @ApiParam({ name: 'organizationId', type: String, required: true })
  async getOrganizationSettings(
    @Param() params,
  ): Promise<OrganizationSettings> {
    const organization = await this.organizationService.validateOrganization(
      params.organizationId,
    );
    if (organization.type !== OrganizationType.HOSPITAL) {
      throw new BadRequestException('Settings is not avaialble');
    }
    if (!organization.organizationSettings) {
      //create organization settings
      const defaultSettings = await this.organizationSettingsModelService.create(
        organization,
      );
      return defaultSettings;
    }
    return organization.organizationSettings;
  }
}
