import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Role } from '../../models/user/entity/user.enum';
import { UserModelService } from '../../models/user/user.model.service';

@Injectable()
export class UserOrganizationAccessGuard implements CanActivate {
  constructor(private readonly userModelService: UserModelService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, params, query, body } = context.switchToHttp().getRequest();
    const organizationId =
      params.organizationId ||
      query.organizationId ||
      body.organizationId ||
      null;
    if (user.role === Role.ADMIN) {
      return true;
    } else {
      if (user.organizationId && user.organizationId === organizationId)
        return true;
    }
    return false;
  }
}
