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
export class OrganizationUserResourceGuard implements CanActivate {
  constructor(private readonly userModelService: UserModelService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, query, params, body } = context.switchToHttp().getRequest();
    if (user.role === Role.ADMIN) {
      return true;
    }
    const userId = params.userId || query.userId || body.userId || null;
    if (userId) {
      // same user
      if (userId === user.id) {
        return true;
      }
      const resource = await this.userModelService.findOne(userId);
      if (!resource) {
        throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
      }
      if (resource.organizationId !== user.organizationId) {
        return false;
      }
    }
    return true;
  }
}
