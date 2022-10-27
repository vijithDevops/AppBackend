import { Gender, Role } from '../entity/user.enum';
import { Address } from '../types';

export class IUpdateUser {
  username?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: Gender;
  address?: Address;
  role?: Role;
  profilePic?: string;
  profilePicThumbnail?: string;
  chatId?: number;
  organizationId?: string;
  isOnWatchlist?: boolean;
  watchlistedAt?: Date;
}
