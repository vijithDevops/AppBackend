import { ResolutionType } from 'src/models/medical_alerts/entity/medical_alerts.enum';

export class IGetTrendsParams {
  id: number;
  start_datetime: string;
  stop_datetime: string;
  resolution: ResolutionType;
}
