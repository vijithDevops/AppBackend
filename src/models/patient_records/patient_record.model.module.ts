import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientRecordModelService } from './patient_record.model.service';
import { PatientRecord } from './entity/patient_record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientRecord])],
  providers: [PatientRecordModelService],
  exports: [PatientRecordModelService],
})
export class PatientNoteModelModule {}
