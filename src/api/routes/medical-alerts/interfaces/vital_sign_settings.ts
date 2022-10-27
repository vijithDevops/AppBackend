import { PatientVitalSignsView } from 'src/models/vital_signs/entity/patient_vital_signs.view.entity';
import { MeasuringScale } from 'src/models/vital_signs/entity/vital_sign.enum';

export type IVitalSignSettings = {
  [key in MeasuringScale]: PatientVitalSignsView;
} & {
  vitalSignId: string;
  vitalSignName: string;
  externalKey: string;
};
