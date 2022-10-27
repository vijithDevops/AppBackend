export class IFindAllSensors {
  patientIdInt?: number;
  organizationId?: string;
  search?: string;
  fields?: string[] = ['createdAt'];
  sorts?: sortFields[] = ['DESC'];
  isActive?: boolean;
  skip: number;
  limit: number;
}
type sortFields = 'ASC' | 'DESC';
export class IFindAvailableSensor {
  organizationId?: string;
  search?: string;
  sort?: 'ASC' | 'DESC' = 'DESC';
  skip: number;
  limit: number;
}
