import { Role } from 'src/models/user/entity/user.enum';
export class UserTokenVerifyResponseDto {
  username: string;
  role: Role;
  patientId: number;
}
