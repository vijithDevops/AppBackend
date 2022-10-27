import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LogService } from '../../services/logger/logger.service';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly logService: LogService) {}
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logService.logError(exception.message, {
      exception,
      request: {
        url: request.url,
        method: request.method ? request.method : 'unknown',
        body: request.body,
        headers: request.headers,
      },
    });

    const errorResponse = {
      statusCode: status,
      message:
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Sorry we are experiencing Internal Server Error.'
          : exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
      errors: exception.message,
    };

    if (exception.response && exception.response.message) {
      // class validator exception.
      errorResponse.message =
        Array.isArray(exception.response.message) &&
        exception.response.message.length
          ? exception.response.message[exception.response.message.length - 1]
          : exception.response.message;
      errorResponse.errors = exception.response.message;
    }

    if (exception.code == 'EREQUEST' && exception.name == 'QueryFailedError') {
      //db exception Internal Server error.
      errorResponse.message =
        'Sorry we are experiencing Internal Server technical problems.';
      errorResponse.statusCode = 500;
      errorResponse.errors = exception.message;
    }
    response.status(status).json(errorResponse);
  }
}
