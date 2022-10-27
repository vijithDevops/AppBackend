import { homedir } from 'os';
import { join } from 'path';
import { LOGGER_PATH } from '../../config/constants';
import * as winston from 'winston';
const { combine, timestamp, label, printf, colorize } = winston.format;
console.log(` LOGGER Path: ${homedir()}/${LOGGER_PATH}`);

// My custom format
const myFormat = printf(
  (info) =>
    `${info.timestamp} [${info.level}]-[${info.label}]: ${info.message} - ${info.context}`,
);

const pad = (num) => (num > 9 ? '' : '0') + num;
const generator = (fileName: string, time = new Date()): string => {
  if (!time) return fileName;

  const month = time.getFullYear() + '-' + pad(time.getMonth() + 1);
  const day = pad(time.getDate());
  const hour = pad(time.getHours());
  const minute = pad(time.getMinutes());

  return `${month}/${month}-${day}-${hour}-${minute}-${fileName}`;
};

// define the custom settings for each transport (file, console)
const options = {
  combinedFile: {
    level: 'info',
    filename: join(
      homedir(),
      `${LOGGER_PATH}/combined/${generator('combined.log')}`,
    ),
    format: combine(label({ label: 'main' }), timestamp(), myFormat),
    handleExceptions: true,
    options: { flags: 'a', mode: 0o666 },
    maxsize: 5242880, // 5MB
    //maxsize: 1000000, // 5MB
    // maxFiles: 10,
  },
  errorFile: {
    level: 'error',
    filename: join(
      homedir(),
      `${LOGGER_PATH}/errors/${generator('error.log')}`,
    ),
    format: combine(label({ label: 'main' }), timestamp(), myFormat),
    handleExceptions: true,
    options: { flags: 'a', mode: 0o666 },
    maxsize: 5242880, // 5MB
    //maxsize: 1000000, // 5MB
    // maxFiles: 5,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    format: combine(
      colorize(),
      label({ label: 'main' }),
      timestamp(),
      myFormat,
    ),
    zippedArchive: true,
    json: false,
    colorize: true,
  },
};

export const LoggerConfigOptions = {
  transports: [
    new winston.transports.File(options.combinedFile),
    new winston.transports.File(options.errorFile),
    new winston.transports.Console(options.console),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: join(
        homedir(),
        `${LOGGER_PATH}/exceptions/${generator('exceptions.log')}`,
      ),
    }),
  ],
  exitOnError: false, // do not exit on handled exceptions
};
