import { ResolutionType } from 'src/models/medical_alerts/entity/medical_alerts.enum';

export class IGetDataServerTrendsFilter {
  start_datetime: string;
  stop_datetime: string;
  resolution: ResolutionType;
}
