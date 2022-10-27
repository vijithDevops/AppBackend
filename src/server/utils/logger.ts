import { INestApplication } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as morgan from 'morgan';
import * as rfs from 'rotating-file-stream';
import { join } from 'path';
import { homedir } from 'os';
import { LOGGER_PATH } from 'src/config/constants';

export const accessLogger = async (app: INestApplication) => {
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: join(homedir(), `${LOGGER_PATH}/api-logs`),
  });
  morgan.token('body', (req) => {
    return JSON.stringify(req.body);
  });
  morgan.token('user', (req) => {
    return JSON.stringify(req.user ? req.user.username : 'No auth user');
  });
  const logString =
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status  req-body :body :res[content-length]- :response-time ms - user- :user token- ":req[Authorization]" ":referrer" ":user-agent"';
  // const logString =
  //   ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]- :response-time ms ":referrer" ":user-agent"';
  app.use(morgan(logString));
  app.use(morgan(logString, { stream: accessLogStream }));
};
