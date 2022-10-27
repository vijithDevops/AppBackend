import {
  ViewEntity,
  ViewColumn,
  Connection,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VitalSignsMaster } from './vital_signs_master.entity';
import { User } from 'src/models/user/entity/user.entity';
import { Role } from 'src/models/user/entity/user.enum';
import { PatientVitalSigns } from './patient_vital_signs.entity';
import { OrganizationVitalSigns } from './organization_vital_signs.entity';
import { MeasuringScale } from './vital_sign.enum';
import { VitalSign } from './vital_sign.entity';

@ViewEntity({
  name: 'patient_vital_signs_view',
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select([
        'vitalSigns.id AS id',
        'vitalSigns.name AS name',
        'vitalSigns.key AS key',
        'vitalSigns.measuringScale AS measuring_scale',
        'vitalSigns.order AS order',
        'vitalSign.id AS vital_sign_id',
        'vitalSign.name AS vital_sign_name',
        'vitalSign.externalKey AS external_key',
        'vitalSign.isMedicalEngineAlert AS is_medical_engine_alert',
        `CASE
          WHEN patientVitalSigns.id IS NOT NULL
            THEN patientVitalSigns.isApplicable
          WHEN organizationVitalSigns.id IS NOT NULL
            THEN organizationVitalSigns.isApplicable
          ELSE vitalSigns.isApplicable
        END AS is_applicable
        `,
        `CASE
          WHEN patientVitalSigns.id IS NOT NULL
            THEN patientVitalSigns.amberValue
          WHEN organizationVitalSigns.id IS NOT NULL
            THEN organizationVitalSigns.amberValue
          ELSE vitalSigns.amberValue
        END AS amber_value
        `,
        `CASE
          WHEN patientVitalSigns.id IS NOT NULL
            THEN patientVitalSigns.redValue
          WHEN organizationVitalSigns.id IS NOT NULL
            THEN organizationVitalSigns.redValue
          ELSE vitalSigns.redValue
        END AS red_value
        `,
        'user.id AS patient_id',
      ])
      .from(VitalSignsMaster, 'vitalSigns')
      .leftJoin(VitalSign, 'vitalSign', 'vitalSign.id = vitalSigns.vitalSignId')
      .leftJoin(User, 'user', `user.role = '${Role.PATIENT}'`)
      .leftJoin(
        PatientVitalSigns,
        'patientVitalSigns',
        'patientVitalSigns.patientId = user.id AND patientVitalSigns.vitalSignId = vitalSigns.id',
      )
      .leftJoin(
        OrganizationVitalSigns,
        'organizationVitalSigns',
        'organizationVitalSigns.organizationId = user.organizationId AND organizationVitalSigns.vitalSignId = vitalSigns.id',
      ),
})
export class PatientVitalSignsView {
  @ViewColumn()
  id: string;

  @ViewColumn({ name: 'name' })
  name: string;

  @ViewColumn({ name: 'key' })
  key: string;

  @ViewColumn({ name: 'measuring_scale' })
  measuringScale: MeasuringScale;

  @ViewColumn({ name: 'order' })
  order: number;

  @ViewColumn({ name: 'vital_sign_name' })
  vitalSignName: string;

  @ViewColumn({ name: 'vital_sign_id' })
  vitalSignId: string;

  @ViewColumn({ name: 'external_key' })
  externalKey: string;

  @ViewColumn({ name: 'is_medical_engine_alert' })
  isMedicalEngineAlert: boolean;

  @ViewColumn({ name: 'is_applicable' })
  isApplicable: string;

  @ViewColumn({ name: 'amber_value' })
  amberValue: number;

  @ViewColumn({ name: 'red_value' })
  redValue: number;

  @ViewColumn({ name: 'patient_id' })
  patientId: string;
  @ManyToOne(() => User, (user) => user.vitalSignsSettings)
  @JoinColumn({ name: 'patient_id' })
  patient: User;
}
