import { Role } from '../../../models/user/entity/user.enum';

export class ICreateCBUser {
  login: string;
  fullName?: string;
  password: string;
  role: Role;
}
