import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { AllExceptionFilter } from 'src/common/filters/all_exception.filter';
import { LogService } from 'src/services/logger/logger.service';
import { accessLogger } from './logger';
import { securityUtils } from './security';
import { swagger } from './swagger';
import { ConfigService } from '@nestjs/config';

export const initUtils = async (app: INestApplication) => {
  const configService = app.get(ConfigService);
  securityUtils(app);
  app.use(cookieParser());
  app.use(compression());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AllExceptionFilter(new LogService()));
  accessLogger(app);
  if (configService.get('ENV') !== 'production') {
    swagger(app);
  }
};
