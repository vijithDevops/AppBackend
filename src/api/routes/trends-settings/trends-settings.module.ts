import { Module } from '@nestjs/common';
import { TrendsSettingsController } from './trends-settings.controller';
import { TrendsSettingsService } from './trends-settings.service';
import { TrendsSettingsModelModule } from '../../../models/trends_settings/trends_settings.module';
import { PatientInfoModelModule } from '../../../models/patient_info/patient_info.model.module';
import { UserModelModule } from '../../../models/user/user.model.module';

@Module({
  imports: [TrendsSettingsModelModule, PatientInfoModelModule, UserModelModule],
  controllers: [TrendsSettingsController],
  providers: [TrendsSettingsService],
  exports: [TrendsSettingsService],
})
export class TrendsSettingsModule {}
