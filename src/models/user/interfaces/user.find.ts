import { Role } from '../entity/user.enum';

export class IChatUsersPaginateOptions {
  skip: number;
  limit: number;
  search?: string;
  organizationId?: string;
}
export class IPatientCareTeamFilter {
  search?: string;
  excludeUserIds?: string[];
  roles?: [Role.CARETAKER, Role.DOCTOR, Role.NURSE][];
}

export class IFindUserOptions {
  skip: number;
  limit: number;
  search?: string;
  gatewayFilter?: string;
  sensorFilter?: string;
  fields?: string[] = ['createdAt'];
  sorts?: sortFields[] = ['DESC'];
  roles?: Role[];
  excludeUserIds?: string[];
  organizationId?: string;
  excludeRoles?: Role[];
  isOnWatchlist?: boolean;
}
type sortFields = 'ASC' | 'DESC';

export class IFindUserAssignedPatientsOptions {
  userId: string;
  skip: number;
  limit: number;
  search?: string;
  isOnWatchlist?: boolean;
  fields?: string[] = ['createdAt'];
  sorts?: sortFields[] = ['DESC'];
}

export class IFindPatientListWithCareteam {
  organizationId: string;
  skip: number;
  limit: number;
  search?: string;
  sortUserId?: string;
}

export class IFindAllUserFilter {
  role?: Role;
}

export class IUserFilter {
  role?: Role;
  organizationId?: string;
}
