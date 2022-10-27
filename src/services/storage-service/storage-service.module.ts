import { Module } from '@nestjs/common';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { StorageService } from './storage-service.service';
import { FileModelModule } from '../../models/file/file.model.module';

@Module({
  imports: [FileModelModule, FileUploadModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageServiceModule {}
