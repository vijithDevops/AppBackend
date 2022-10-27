import { Module } from '@nestjs/common';
import { FileUploadClientConnectionModule } from 'src/config/connections/file-upload-client/connection.file-upload-client.module';
import { FileUploadService } from './file-upload.service';

@Module({
  imports: [FileUploadClientConnectionModule],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
