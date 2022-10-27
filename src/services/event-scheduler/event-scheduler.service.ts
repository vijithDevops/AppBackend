import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EVENT_SCHEDULER_SERVICE } from '../../config/constants';
import { EVENT_SCHEDULERS } from '../../config/master-data-constants';
import {
  ICreateDailyReminder,
  ICreateScheduledReminder,
  IUpdateScheduledReminder,
  IDeleteScheduledReminder,
  IDeleteDailyReminder,
  IUpdateDailyReminder,
  ICreateIntervalJobs,
  IUpdateIntervalJobs,
  ICreateDailyDefaultReminder,
} from './interfaces';

@Injectable()
export class EventSchedulerService {
  constructor(
    @Inject(EVENT_SCHEDULER_SERVICE) private eventScheduler: ClientProxy,
  ) {}

  async createScheduledReminder(
    dto: ICreateScheduledReminder,
  ): Promise<string> {
    try {
      return await this.eventScheduler
        .send(EVENT_SCHEDULERS.SCHEDULED_REMINDER.CREATE, dto)
        .toPromise();
    } catch (error) {
      throw error;
    }
  }

  async createDailyReminder(dto: ICreateDailyReminder): Promise<string> {
    try {
      return await this.eventScheduler
        .send(EVENT_SCHEDULERS.DAILY_REMINDER.CREATE, dto)
        .toPromise();
    } catch (error) {
      throw error;
    }
  }

  async createIntervalJob(dto: ICreateIntervalJobs): Promise<string> {
    try {
      return await this.eventScheduler
        .send(EVENT_SCHEDULERS.INTERVAL_JOBS.CREATE, dto)
        .toPromise();
    } catch (error) {
      throw error;
    }
  }

  async createDailyDefaultReminder(
    dto: ICreateDailyDefaultReminder,
  ): Promise<string> {
    try {
      return await this.eventScheduler
        .send(EVENT_SCHEDULERS.DAILY_DEFAULT_REMINDER.CREATE, dto)
        .toPromise();
    } catch (error) {
      throw error;
    }
  }

  async deleteAllDefaultReminbersOfOrganization(
    organizationId: string,
  ): Promise<string> {
    try {
      return await this.eventScheduler
        .send(EVENT_SCHEDULERS.DAILY_DEFAULT_REMINDER.DELETE, {
          organizationId,
        })
        .toPromise();
    } catch (error) {
      throw error;
    }
  }

  async deleteAllDailyDefaultReminders(): Promise<void> {
    try {
      return await this.eventScheduler
        .send(EVENT_SCHEDULERS.DAILY_DEFAULT_REMINDER.DELETE, {})
        .toPromise();
    } catch (error) {
      throw error;
    }
  }

  async updateIntervalJobs(dto: IUpdateIntervalJobs): Promise<string> {
    try {
      return await this.eventScheduler
        .send(EVENT_SCHEDULERS.INTERVAL_JOBS.UPDATE, dto)
        .toPromise();
    } catch (error) {
      throw error;
    }
  }

  async deleteJob(jobId: string): Promise<void> {
    try {
      return await this.eventScheduler
        .send(EVENT_SCHEDULERS.SCHEDULER_JOBS.DELETE, {
          jobId,
        })
        .toPromise();
    } catch (error) {
      throw error;
    }
  }

  async updateScheduledReminder(
    dto: IUpdateScheduledReminder,
  ): Promise<string> {
    try {
      return await this.eventScheduler
        .send(EVENT_SCHEDULERS.SCHEDULED_REMINDER.UPDATE, dto)
        .toPromise();
    } catch (error) {
      throw error;
    }
  }

  async updateDailyReminder(dto: IUpdateDailyReminder): Promise<string> {
    try {
      return await this.eventScheduler
        .send(EVENT_SCHEDULERS.DAILY_REMINDER.UPDATE, dto)
        .toPromise();
    } catch (error) {
      throw error;
    }
  }

  async deleteScheduledReminder(
    dto: IDeleteScheduledReminder,
  ): Promise<string> {
    try {
      return await this.eventScheduler
        .send(EVENT_SCHEDULERS.SCHEDULED_REMINDER.DELETE, {
          jobId: dto.reminderId,
          ...dto,
        })
        .toPromise();
    } catch (error) {
      throw error;
    }
  }

  async deleteDailyReminder(dto: IDeleteDailyReminder): Promise<string> {
    try {
      return await this.eventScheduler
        .send(EVENT_SCHEDULERS.SCHEDULED_REMINDER.DELETE, {
          jobId: dto.reminderId,
          ...dto,
        })
        .toPromise();
    } catch (error) {
      throw error;
    }
  }

  async deleteReminder(reminderId: string): Promise<string> {
    try {
      return await this.eventScheduler
        .send(EVENT_SCHEDULERS.SCHEDULER_JOBS.DELETE, {
          jobId: reminderId,
        })
        .toPromise();
    } catch (error) {
      throw error;
    }
  }

  async enableReminder(reminderId: string): Promise<string> {
    try {
      return await this.eventScheduler
        .send(EVENT_SCHEDULERS.SCHEDULER_JOBS.ENABLE, {
          jobId: reminderId,
        })
        .toPromise();
    } catch (error) {
      throw error;
    }
  }

  async disableReminder(reminderId: string): Promise<string> {
    try {
      return await this.eventScheduler
        .send(EVENT_SCHEDULERS.SCHEDULER_JOBS.DISABLE, {
          jobId: reminderId,
        })
        .toPromise();
    } catch (error) {
      throw error;
    }
  }
}
