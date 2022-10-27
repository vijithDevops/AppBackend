import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';

export const getStartOfMonthDate = (date: Date): Date => {
  const dateObj = new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1, 0, 0, 0);
};

export const getEndOfMonthDate = (date: Date): Date => {
  const dateObj = new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0, 0, 0, 0);
};

export const getStartOfDayDate = (date: Date): Date => {
  const dateObj = new Date(date);
  return new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    0,
    0,
    0,
  );
};

export const getEndOfDayDate = (date: Date): Date => {
  const dateObj = new Date(date);
  return new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    23,
    59,
    59,
    999,
  );
};
export const geStartOfDayUTCDate = (date: Date): Date => {
  const momentDate = moment.utc(date);
  momentDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  return momentDate.toDate();
};

export const geStartOfToday = (): Date => {
  const today = new Date();
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0,
  );
};

export const geStartOfYesterday = (): Date => {
  const today = new Date();
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 1,
    0,
    0,
    0,
  );
};

export const getDateString = (date: Date): string => {
  return `${date.getDate}-${date.getMonth}-${date.getFullYear}`;
};

export const getDate = (date?: Date): number => {
  if (date) {
    return new Date(date).getDate();
  } else {
    return new Date().getDate();
  }
};

export const checkDateOccursInBetweenDates = (
  dateIntervals: { startDate?: Date; endDate?: Date }[],
  date: Date,
): boolean => {
  return dateIntervals.find((interval) => {
    const startDateValidity = interval.startDate
      ? getStartOfDayDate(interval.startDate) <= date
      : true;
    const endDateValidity = interval.endDate
      ? date <= getStartOfDayDate(interval.endDate)
      : true;
    // getStartOfDayDate(interval.startDate) <= date &&
    // date <= getStartOfDayDate(interval.endDate),
    return startDateValidity && endDateValidity;
  })
    ? true
    : false;
};

export const subtractDays = (value: number, fromDate?: Date): Date => {
  if (!fromDate) fromDate = new Date();
  const date = new Date(fromDate);
  date.setDate(fromDate.getDate() - value);
  return date;
};

export const subtractMonths = (value: number, fromDate?: Date): Date => {
  if (!fromDate) fromDate = new Date();
  const date = new Date(fromDate);
  date.setMonth(fromDate.getMonth() - value);
  return date;
};

export const addDays = (value: number, fromDate?: Date): Date => {
  if (!fromDate) fromDate = new Date();
  const date = new Date(fromDate);
  date.setDate(fromDate.getDate() + value);
  return date;
};

export const subtractHours = (value: number, fromDate?: Date): Date => {
  if (!fromDate) fromDate = new Date();
  const date = new Date(fromDate);
  date.setHours(fromDate.getHours() - value);
  return date;
};

export const addHours = (value: number, fromDate?: Date): Date => {
  if (!fromDate) fromDate = new Date();
  const date = new Date(fromDate);
  date.setHours(fromDate.getHours() + value);
  return date;
};

export const getTimeDurationString = (
  startDate: Date,
  endDate: Date,
): string => {
  const timeDifference = endDate.getTime() - startDate.getTime();
  // const secDiff = timeDifference / 1000; //in s
  const minDiff = timeDifference / 60 / 1000; //in minutes
  const hourDiff = timeDifference / 3600 / 1000; //in hours
  const duration = { hours: 0, minutes: 0 };
  duration.hours = Math.floor(hourDiff);
  duration.minutes = minDiff - 60 * duration.hours;
  console.log(duration); //{hours: 0, minutes: 30}
  return `${duration.hours} hours ${duration.minutes} minutes`;
};

export const getTimezoneOffset = (timezone: string): string => {
  const offset = momentTimezone.tz(new Date(), timezone).format('Z');
  return offset;
};

export const getTimezoneLocalTime = (date: Date, timezone: string): string => {
  return date.toLocaleString('en-US', { timeZone: timezone });
};
