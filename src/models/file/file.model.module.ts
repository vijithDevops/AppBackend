import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileModelService } from './file.model.service';
import { File } from './entity/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [FileModelService],
  exports: [FileModelService],
})
export class FileModelModule {}
