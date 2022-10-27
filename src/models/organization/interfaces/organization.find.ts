import { OrganizationType } from '../entity/organization.enum';

export class IFindAllOrganizations {
  sort?: 'ASC' | 'DESC' = 'DESC';
  skip: number;
  limit: number;
  search?: string;
  types?: OrganizationType[];
}
export class IFindPublicOrganizationOptions {
  search?: string;
  types?: OrganizationType[];
  skip: number;
  limit: number;
}
