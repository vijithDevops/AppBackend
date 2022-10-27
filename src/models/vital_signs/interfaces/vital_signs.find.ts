import { OrganizationVitalSignsView } from '../entity/organization_vital_signs.view.entity';
import { PatientVitalSignsView } from '../entity/patient_vital_signs.view.entity';

export interface IVitalSigns {
  key: string;
  name: string;
  isApplicable: boolean;
  amberValue: number;
  redValue: number;
}
export interface IVitalSignsObject {
  [key: string]: OrganizationVitalSignsView;
}

export class IPatientVitalVitalSignsObject {
  [key: string]: PatientVitalSignsView;
}
// export interface IVitalSignsObject {
//   [key: string]: {
//     name: string;
//     isApplicable: boolean;
//     amberValue: number;
//     redValue: number;
//   };
// }
