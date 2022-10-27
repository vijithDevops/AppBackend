import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { FileModelModule } from '../../../models/file/file.model.module';
import { UserModelModule } from '../../../models/user/user.model.module';
import { StorageServiceModule } from '../../../services/storage-service/storage-service.module';
import { CaretakerInfoModelModule } from '../../../models/caretaker_info/caretaker_info.model.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './files',
    }),
    FileModelModule,
    UserModelModule,
    StorageServiceModule,
    CaretakerInfoModelModule,
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService],
})
export class FileUploadModule {}
