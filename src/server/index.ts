import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { initUtils } from './utils/init.utils';

export async function bootstrap() {
  const appOptions = { cors: true, logger: true };
  const app = await NestFactory.create(AppModule, appOptions);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');
  initUtils(app); // initialize all utils
  await app.listen(configService.get('PORT'), configService.get('HOST'));
  console.log(`Application running on: ${await app.getUrl()}`);
}
