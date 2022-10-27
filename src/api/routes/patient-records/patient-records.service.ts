import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FileModelService } from '../../../models/file/file.model.service';
import { PatientRecordType } from 'src/models/patient_records/entity/patient_record.enum';
import { PatientRecord } from 'src/models/patient_records/entity/patient_record.entity';
import { PatientRecordModelService } from '../../../models/patient_records/patient_record.model.service';
import { LogService } from 'src/services/logger/logger.service';
import { User } from 'src/models/user/entity/user.entity';

@Injectable()
export class PatientRecordsService {
  constructor(
    private readonly fileModelService: FileModelService,
    private readonly patientRecordModelService: PatientRecordModelService,
    private logService: LogService,
  ) {}

  async createPatientRecordFiles(
    patient: User,
    fileIds: string[],
  ): Promise<PatientRecord[]> {
    try {
      const files = await this.fileModelService
        .validateAndGetFiles(fileIds)
        .catch((err) => {
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        });
      const patientFiles = files.map((file) => {
        if (
          file.organizationId &&
          file.organizationId !== patient.organizationId
        ) {
          throw new Error('Invalid file in organization for patient record');
        }
        return {
          patientId: patient.id,
          fileId: file.id,
          type: PatientRecordType.FILE,
        };
      });
      return await this.patientRecordModelService
        .createMany(patientFiles)
        .catch((err) => {
          this.logService.logError('Error adding patient record files', err);
          throw new Error('Failed to add patient record Files');
        });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
