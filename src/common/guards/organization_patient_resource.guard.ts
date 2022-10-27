import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Role } from '../../models/user/entity/user.enum';
import { UserModelService } from '../../models/user/user.model.service';

@Injectable()
export class OrganizationPatientResourceGuard implements CanActivate {
  constructor(private readonly userModelService: UserModelService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, query, params, body } = context.switchToHttp().getRequest();
    if (user.role === Role.ADMIN) {
      return true;
    }
    const patientId =
      params.patientId || query.patientId || body.patientId || null;
    if (patientId) {
      //same user
      if (patientId === user.id) {
        return true;
      }
      const patient = await this.userModelService.findOne(
        patientId,
        Role.PATIENT,
      );
      if (!patient) {
        throw new HttpException('Invalid patient', HttpStatus.BAD_REQUEST);
      }
      if (patient.organizationId !== user.organizationId) {
        return false;
      }
    }
    return true;
  }
}
