import { OrganizationModelService } from 'src/models/organization/organization.model.service';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  HttpException,
} from '@nestjs/common';

@Injectable()
export class OrganizationClientAuthGuard implements CanActivate {
  constructor(
    private readonly organizationModelService: OrganizationModelService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers['auth-token']) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const organization = await this.organizationModelService.findOneByAuthTokenAndAccessCode(
      request.headers['auth-token'],
      request.body.reg_code,
    );
    if (!organization)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    request.organization = organization;
    return true;
  }
}
