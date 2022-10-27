import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Role } from '../../models/user/entity/user.enum';

@Injectable()
export class PatientResourceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user, query, params, body } = context.switchToHttp().getRequest();
    const patientId =
      query.patientId || params.patientId || body.patientId || null;
    switch (user.role) {
      case Role.PATIENT:
        if (patientId === null)
          throw new HttpException(
            'patientId required for Patient Role',
            HttpStatus.BAD_REQUEST,
          );
        return user.id === patientId;
      case Role.CARETAKER:
        if (patientId === null)
          throw new HttpException(
            'patientId required for Caretaker Role',
            HttpStatus.BAD_REQUEST,
          );
        return (
          user.caretakersPatient &&
          user.caretakersPatient.patientId === patientId
        );
      case Role.DOCTOR:
        return true;
      case Role.ADMIN:
        return true;
      case Role.NURSE:
        return true;
      default:
        return false;
    }
  }
}
