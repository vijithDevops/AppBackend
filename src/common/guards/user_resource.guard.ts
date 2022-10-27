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
export class UserResourceGuard implements CanActivate {
  constructor(private readonly userModelService: UserModelService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, params, query, body } = context.switchToHttp().getRequest();
    let resourceId = params.userId || query.userId || body.userId || null;
    if (!resourceId) {
      resourceId = params.id || null;
    }
    const resource = await this.userModelService
      .findOne(resourceId)
      .catch((err) => {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      });
    if (!resource) {
      throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
    }
    if (user.role === Role.ADMIN) {
      return true;
    } else if (user.role === Role.NURSE) {
      if (resource.role != Role.ADMIN) return true;
    } else if (user.role === Role.DOCTOR) {
      // if (
      //   resource.role === Role.PATIENT ||
      //   resource.role === Role.CARETAKER ||
      //   user.id === resourceId
      // )
      if (resource.role != Role.ADMIN) return true;
    } else if (user.role === Role.PATIENT) {
      if (user.id === resourceId) return true;
    } else if (user.role === Role.CARETAKER) {
      if (
        user.id === resourceId ||
        user.caretakersPatient.patientId === resourceId
      )
        return true;
    }
    return false;
  }
}
