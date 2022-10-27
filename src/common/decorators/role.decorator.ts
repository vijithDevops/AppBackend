import { SetMetadata } from '@nestjs/common';
import { Role } from '../../models/user/entity/user.enum';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
