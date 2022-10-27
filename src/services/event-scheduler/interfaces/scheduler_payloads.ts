import { DAILY_REMINDER } from 'src/services/event-scheduler/event-scheduler.enum';
export class ICreateReminderPayload {
  id?: string;
}

export class ICreateIntervalPayload {
  id?: string;
}

export class ICreateDailyDefaultReminderPayload {
  organizationId: string;
  hour: string;
  minute: string;
  types: DAILY_REMINDER[];
}
