import {
  HttpException,
  HttpStatus,
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '../../models/user/entity/user.enum';
import { SensorModelService } from '../../models/sensor/sensor.model.service';
import { PatientInfoModelService } from '../../models/patient_info/patient_info.model.service';
import { GatewayModelService } from '../../models/gateway/gateway.model.service';

/* Patient should only be allowed to perform actions on gateways assigned to them */

@Injectable()
export class GatewayGuard implements CanActivate {
  constructor(
    private readonly sensorModelService: SensorModelService,
    private readonly gatewayModelService: GatewayModelService,
    private readonly patientInfoModelService: PatientInfoModelService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, params } = context.switchToHttp().getRequest();
    const gatewayId = params.id || null;
    if (
      user.role === Role.ADMIN ||
      user.role === Role.NURSE ||
      user.role === Role.DOCTOR
    ) {
      return true;
    } else if (user.role === Role.PATIENT) {
      const patientId = user.id;
      await this.gatewayModelService
        .findOneByGatewayAndPatientIdInt(gatewayId, patientId)
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
      await this.gatewayModelService
        .findOneByGatewayAndPatientIdInt(gatewayId, patientInfo.patientId)
        .catch((err) => {
          throw new HttpException(err, HttpStatus.BAD_REQUEST);
        });
      return true;
    }

    return false;
  }
}
