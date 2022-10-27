import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Role } from '../../models/user/entity/user.enum';
import { OrganizationModelService } from '../../models/organization/organization.model.service';

@Injectable()
export class OrganizationFilterGuard implements CanActivate {
  constructor(
    private readonly organizationModelService: OrganizationModelService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { method, user, query, body } = context.switchToHttp().getRequest();
    const organizationId = query.organizationId || body.organizationId || null;
    if (user.role === Role.ADMIN) {
      if (!organizationId && method === 'POST') {
        throw new HttpException(
          `${Role.ADMIN} must specify the organization for create operations`,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (organizationId) {
        const organization = await this.organizationModelService.findOneById(
          organizationId,
        );
        if (!organization) {
          throw new HttpException(
            `Invalid organization`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    } else {
      if (organizationId && organizationId !== user.organizationId) {
        return false;
      }
      //apply organization filter for other users
      if (body && Object.keys(body).length > 0 && body.constructor === Object) {
        // add organization filter for POST APIs
        body['organizationId'] = user.organizationId;
      } else {
        query['organizationId'] = user.organizationId;
      }
    }
    return true;
  }
}
