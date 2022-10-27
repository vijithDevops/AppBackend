import { EventSchedulerService } from 'src/services/event-scheduler/event-scheduler.service';
import { LogService } from 'src/services/logger/logger.service';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { isValidHttpUrl } from 'src/common/utils/helpers';
import { Organization } from 'src/models/organization/entity/organization.entity';
import { OrganizationModelService } from 'src/models/organization/organization.model.service';
import { INTERVAL_JOBS } from 'src/services/event-scheduler/event-scheduler.enum';
import { NotificationReminderService } from '../notification-reminder/notification-reminder.service';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationModelService: OrganizationModelService,
    private readonly logService: LogService,
    private readonly eventSchedulerService: EventSchedulerService,
    private readonly notificationReminderService: NotificationReminderService,
  ) {}

  async validateOrganization(organizationId: string): Promise<Organization> {
    const organization = await this.organizationModelService.findOne(
      organizationId,
    );
    if (!organization) {
      throw new HttpException(
        'Invalid organization id',
        HttpStatus.BAD_REQUEST,
      );
    }
    return organization;
  }

  handleCreateOrganizationErrorMessage(err: {
    message: string;
    detail: any;
  }): HttpException {
    try {
      if (err.message && err.message.includes('duplicate key')) {
        const errorString = err.detail;
        const uniqueKeys = [
          {
            key: 'name',
            name: 'Name',
          },
          {
            key: 'phone_number',
            name: 'Phone Number',
          },
          {
            key: 'email',
            name: 'Email',
          },
        ];
        const errorKey = uniqueKeys.find((key) =>
          errorString.includes(key.key),
        );
        if (errorKey) {
          return new HttpException(
            `${errorKey.name} already used by another Organization`,
            HttpStatus.BAD_REQUEST,
          );
        } else {
          return new HttpException(
            'Duplicate input found',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        return new HttpException(
          'Failed to create Organization for invalid inputs',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  validateApiEnabledUrls(clientUrl: string, dataStoreUrl: string) {
    try {
      if (clientUrl && dataStoreUrl) {
        if (!isValidHttpUrl(clientUrl) || !isValidHttpUrl(dataStoreUrl)) {
          throw new BadRequestException(
            'Clinet Url and Datastore Url must be a valid HTTP/HTTPS URL',
          );
        }
      } else {
        throw new BadRequestException(
          'Clinet Url and Datastore Url is required',
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async updateSchedledEventsOfOrganizationOnTimezoneUpdate(
    organization: Organization,
  ) {
    try {
      if (organization.timezone) {
        await Promise.all([
          //delete existing reminder
          this.notificationReminderService.deleteOrganizationDefaultReminders(
            organization,
          ),
          // delete existing update cache event
          this.deleteScheduledPatientCacheUpdateEvent(organization),
        ]);
      }
      // schedule new default reminders
      this.notificationReminderService.scheduleDefaultRemindesForOrganziation(
        organization,
      );
      // scheduled update cache event
      this.schedulePatientCacheUpdateEvent(organization);
    } catch (error) {
      throw error;
    }
  }

  async schedulePatientCacheUpdateEvent(organization: Organization) {
    try {
      this.logService.logInfo(
        `Scheduling patient cache update on DP for Organization ${organization.name}`,
        { id: organization.id, timezone: organization.timezone },
      );
      const schedulerId = await this.eventSchedulerService.createIntervalJob({
        type: INTERVAL_JOBS.DP_CACHE_UPDATE,
        interval: '0 0 * * *',
        payload: {
          id: organization.id,
        },
        options: {
          timezone: organization.timezone,
        },
      });
      await this.organizationModelService.updateCacheUpdateSchedulerId(
        organization.id,
        schedulerId,
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteScheduledPatientCacheUpdateEvent(organization: Organization) {
    try {
      if (organization.cacheUpdateSchedulerId) {
        this.logService.logInfo(
          `Deleting scheduled cache update event for Organization "${organization.name}"`,
          { id: organization.id },
        );
        await this.eventSchedulerService.deleteJob(
          organization.cacheUpdateSchedulerId,
        );
        this.logService.logInfo(
          `Deleted scheduled cache update event of Organization "${organization.name}"`,
          { id: organization.id },
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async resetAllOrganizationsUpdateCacheEvent(organizations: Organization[]) {
    try {
      this.logService.logInfo('');
      organizations.forEach(async (organization) => {
        if (organization.timezone) {
          if (organization.cacheUpdateSchedulerId) {
            await this.deleteScheduledPatientCacheUpdateEvent(organization);
          }
          await this.schedulePatientCacheUpdateEvent(organization);
        }
      });
    } catch (error) {
      throw error;
    }
  }
}
