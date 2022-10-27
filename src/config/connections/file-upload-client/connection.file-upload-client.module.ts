import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AWS_S3_Connection } from './connection.file-upload-client.provider';

@Module({
  imports: [ConfigModule],
  providers: [AWS_S3_Connection],
  exports: [AWS_S3_Connection],
})
export class FileUploadClientConnectionModule {}
