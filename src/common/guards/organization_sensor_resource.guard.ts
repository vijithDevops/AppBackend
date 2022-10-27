import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Role } from '../../models/user/entity/user.enum';
import { SensorModelService } from '../../models/sensor/sensor.model.service';

@Injectable()
export class OrganizationSensorResourceGuard implements CanActivate {
  constructor(private readonly sensorModelService: SensorModelService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, query, params, body } = context.switchToHttp().getRequest();
    if (user.role === Role.ADMIN) {
      return true;
    }
    let sensorId = params.sensorId || query.sensorId || body.sensorId || null;
    if (!sensorId) {
      sensorId = params.id || query.id || body.id || null;
    }
    if (sensorId) {
      const gateway = await this.sensorModelService.findOne(sensorId);
      if (!gateway) {
        throw new HttpException('Invalid gateway', HttpStatus.BAD_REQUEST);
      }
      if (gateway.organizationId !== user.organizationId) {
        return false;
      }
    }
    return true;
  }
}
