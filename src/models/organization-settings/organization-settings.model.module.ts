import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationSettings } from './entity/organization-settings.entity';
import { OrganizationSettingsModelService } from './organization-settings.model.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationSettings])],
  providers: [OrganizationSettingsModelService],
  exports: [OrganizationSettingsModelService],
})
export class OrganizationSettingsModelModule {}
