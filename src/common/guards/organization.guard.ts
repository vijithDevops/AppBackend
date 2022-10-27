import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Role } from '../../models/user/entity/user.enum';
import { OrganizationModelService } from '../../models/organization/organization.model.service';
import { OrganizationType } from '../../models/organization/entity/organization.enum';

/* Admins and clinicians can view the data but clinicians are restricted to
  creating/updating "Hospital" type only.
*/

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(
    private readonly organizationModelService: OrganizationModelService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, body, params } = context.switchToHttp().getRequest();
    // const { type } = body;
    const id = params.organizationId || params.id;
    const organization = await this.organizationModelService.findOne(id);
    if (user.role === Role.ADMIN) {
      return true;
    } else if (user.role === Role.DOCTOR || Role.NURSE) {
      if (
        // type === OrganizationType.HOSPITAL ||
        organization.type === OrganizationType.HOSPITAL &&
        organization.id === user.organizationId
      ) {
        return true;
      }
    }
    return false;
  }
}
