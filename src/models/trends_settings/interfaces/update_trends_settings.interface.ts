import { GraphTypes } from '../constants/graphtypes.enum';

export class IUpdateTrendsSettings {
  refArr: GraphTypes[];
  patientId: string;
  userId: string;
  id?: string;
}
