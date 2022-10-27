import { Module } from '@nestjs/common';
import { PatientRecordsService } from './patient-records.service';
import { PatientRecordsController } from './patient-records.controller';
import { PatientNoteModelModule } from '../../../models/patient_records/patient_record.model.module';
import { FileModelModule } from '../../../models/file/file.model.module';
import { UserModelModule } from 'src/models/user/user.model.module';

@Module({
  imports: [PatientNoteModelModule, FileModelModule, UserModelModule],
  controllers: [PatientRecordsController],
  providers: [PatientRecordsService],
})
export class PatientRecordsModule {}
