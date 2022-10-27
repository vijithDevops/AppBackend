import { Gender, Role } from '../entity/user.enum';
import { Address } from '../types';

export class ICreateUser {
  username: string;
  password: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: Gender;
  address?: Address;
  role: Role;
  profilePic?: string;
  profilePicThumbnail?: string;
  isClinicalTrialUser?: boolean;
  isClientPatient?: boolean;
  organizationId?: string;
}
