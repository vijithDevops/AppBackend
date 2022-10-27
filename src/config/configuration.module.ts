import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { homedir } from 'os';
import { join } from 'path';
import { ENV_PATH } from './constants';

console.log(` ENV Path: ${homedir()}/${ENV_PATH}`);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(homedir(), ENV_PATH),
      cache: true,
      isGlobal: true,
    }),
  ],
})
export class ConfigurationModule {}
