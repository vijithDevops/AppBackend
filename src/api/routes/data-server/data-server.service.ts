import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/models/user/entity/user.entity';
import { PatientInfoModelService } from '../../../models/patient_info/patient_info.model.service';

@Injectable()
export class DataServerService {
  constructor(private patientInfoModelService: PatientInfoModelService) {}

  async validateAndGetPatientByPatientIdInt(id: number): Promise<User> {
    return await this.patientInfoModelService
      .findPatientByPatientIdInt(id)
      .catch((err) => {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      });
  }
}
