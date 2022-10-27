import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstantsModelService } from './constants.module.service';
import { Constants } from './entity/constants.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Constants])],
  providers: [ConstantsModelService],
  exports: [ConstantsModelService],
})
export class ConstantsModule {}
