import { INTERVAL_JOBS } from '../event-scheduler.enum';
import { ICreateIntervalPayload } from './scheduler_payloads';

export class ICreateIntervalJobs {
  type: INTERVAL_JOBS;
  interval: string;
  payload?: ICreateIntervalPayload = {};
  options?: ICreateIntervalJobOptions;
}

export class IUpdateIntervalJobs {
  jobId: string;
  type: INTERVAL_JOBS;
  interval: string;
  payload?: ICreateIntervalPayload = {};
}

export class ICreateIntervalJobOptions {
  timezone?: string;
  skipImmediate?: boolean = true;
}
