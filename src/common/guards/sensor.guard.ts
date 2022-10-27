import {
  HttpException,
  HttpStatus,
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '../../models/user/entity/user.enum';

/* Patient should only be allowed to perform actions on sensors assigned to them */
import { SensorModelService } from '../../models/sensor/sensor.model.service';
import { PatientInfoModelService } from '../../models/patient_info/patient_info.model.service';

@Injectable()
export class SensorGuard implements CanActivate {
  constructor(
    private readonly sensorModelService: SensorModelService,
    private readonly patientInfoModelService: PatientInfoModelService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, params } = context.switchToHttp().getRequest();
    const sensorId = params.id || null;
    if (
      user.role === Role.ADMIN ||
      user.role === Role.NURSE ||
      user.role === Role.DOCTOR
    ) {
      return true;
    } else if (user.role === Role.PATIENT) {
      const patientId = user.id;
      await this.sensorModelService
        .findOneBySensorAndPatientIdInt(sensorId, patientId)
        .catch((err) => {
          throw new HttpException(err, HttpStatus.BAD_REQUEST);
        });
      return true;
    } else if (user.role === Role.CARETAKER) {
      const patientId = user.caretakersPatient.patientId;
      if (!patientId) {
        throw new ForbiddenException();
      }
      const patientInfo = await this.patientInfoModelService
        .findPatientInfoByUserId(patientId)
        .catch((err) => {
          throw new HttpException(err, HttpStatus.BAD_REQUEST);
        });
      await this.sensorModelService
        .findOneBySensorAndPatientIdInt(sensorId, patientInfo.patientId)
        .catch((err) => {
          throw new HttpException(err, HttpStatus.BAD_REQUEST);
        });
      return true;
    }

    return false;
  }
}
