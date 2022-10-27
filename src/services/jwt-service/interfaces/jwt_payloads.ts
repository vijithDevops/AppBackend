import { Role } from './../../../models/user/entity/user.enum';

export class IJwtTokenPayload {
  username: string;
  sub: string;
  role: Role;
}

export class IJwtRefreshTokenPayload {
  username: string;
}
