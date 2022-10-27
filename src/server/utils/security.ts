import { INestApplication } from '@nestjs/common';
// import expressRateLimit from 'express-rate-limit';
// import helmet from 'helmet';
// import * as expressRateLimit from 'express-rate-limit';
import * as helmet from 'helmet';
export const securityUtils = async (app: INestApplication) => {
  app.use(helmet());
  app.enableCors();
  // app.use(csurf());
  // app.use(
  //   expressRateLimit({
  //     windowMs: 15 * 60 * 1000, // 15 minutes
  //     max: 100, // limit each IP to 100 requests per windowMs
  //   }),
  // );
};
