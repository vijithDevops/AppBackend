import { ICreateDailyDefaultReminderPayload } from './scheduler_payloads';

export class ICreateDailyDefaultReminder {
  hour: string;
  minute: string;
  payload: ICreateDailyDefaultReminderPayload;
  options?: {
    timezone: string;
    skipImmediate?: boolean;
  };
}
