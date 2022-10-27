import { Module } from '@nestjs/common';
import { PublicService } from './public.service';
import { PublicController } from './public.controller';
import { UserModelModule } from '../../../models/user/user.model.module';
import { OrganizationModelModule } from '../../../models/organization/organization.model.module';

@Module({
  imports: [UserModelModule, OrganizationModelModule],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
