import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AppointmentModelService } from 'src/models/appointment/appointment.model.service';
import { Role } from '../../models/user/entity/user.enum';

@Injectable()
export class OrganizationAppointmentResourceGuard implements CanActivate {
  constructor(
    private readonly appointmentModelService: AppointmentModelService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, query, params, body } = context.switchToHttp().getRequest();
    if (user.role === Role.ADMIN) {
      return true;
    }
    let appointmentId =
      params.appointmentId || query.appointmentId || body.appointmentId || null;
    if (!appointmentId) {
      appointmentId = params.id || query.id || body.id || null;
    }
    if (appointmentId) {
      const appointment = await this.appointmentModelService.findOneById(
        appointmentId,
      );
      if (!appointment) {
        throw new HttpException('Invalid appointment', HttpStatus.BAD_REQUEST);
      }
      if (appointment.organizationId !== user.organizationId) {
        return false;
      }
    }
    return true;
  }
}
