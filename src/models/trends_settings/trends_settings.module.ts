import { Module } from '@nestjs/common';
import { TrendsSettingsModelService, DefaultTrendsSettingsModelService, UserTrendsSettingsModelService } from './trends_settings.service';
import { TrendsSettings, UserTrendsSettings, DefaultTrendsSettings } from './entity/trends_settings.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TrendsSettings, UserTrendsSettings, DefaultTrendsSettings])],
  providers: [TrendsSettingsModelService, DefaultTrendsSettingsModelService, UserTrendsSettingsModelService],
  exports: [TrendsSettingsModelService, DefaultTrendsSettingsModelService, UserTrendsSettingsModelService],
})
export class TrendsSettingsModelModule {}
