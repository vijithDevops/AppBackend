import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationModelService } from './organization.model.service';
import { Organization } from './entity/organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organization])],
  providers: [OrganizationModelService],
  exports: [OrganizationModelService],
})
export class OrganizationModelModule {}
