import { Injectable, Logger, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LogService extends Logger {
  constructor() {
    super();
  }

  logError(message: string, errObj: any, context?: any) {
    this.error(
      `${message} - [ERROR]: ${JSON.stringify(errObj ? errObj : {})}`,
      null,
      context ? context : '',
    );
  }

  logInfo(message: string, logObj?: any, context?: string) {
    this.log(
      `${message} - [LOG]: ${JSON.stringify(logObj ? logObj : {})}`,
      context ? context : '',
    );
  }
}
