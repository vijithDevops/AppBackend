import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationVitalSigns } from './entity/organization_vital_signs.entity';
import { OrganizationVitalSignsView } from './entity/organization_vital_signs.view.entity';
import { PatientVitalSigns } from './entity/patient_vital_signs.entity';
import { PatientVitalSignsView } from './entity/patient_vital_signs.view.entity';
import { VitalSignsMaster } from './entity/vital_signs_master.entity';
import { VitalSignsModelService } from './vital_signs.model.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VitalSignsMaster,
      OrganizationVitalSigns,
      OrganizationVitalSignsView,
      PatientVitalSigns,
      PatientVitalSignsView,
    ]),
  ],
  providers: [VitalSignsModelService],
  exports: [VitalSignsModelService],
})
export class VitalSignsModelModule {}
