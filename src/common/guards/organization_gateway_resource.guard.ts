import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Role } from '../../models/user/entity/user.enum';
import { GatewayModelService } from '../../models/gateway/gateway.model.service';

@Injectable()
export class OrganizationGatewayResourceGuard implements CanActivate {
  constructor(private readonly gatewayModelService: GatewayModelService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, query, params, body } = context.switchToHttp().getRequest();
    if (user.role === Role.ADMIN) {
      return true;
    }
    let gatewayId =
      params.gatewayId || query.gatewayId || body.gatewayId || null;
    if (!gatewayId) {
      gatewayId = params.id || query.id || body.id || null;
    }
    if (gatewayId) {
      const gateway = await this.gatewayModelService.findOne(gatewayId);
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
