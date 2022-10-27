import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorInfoModelService } from './doctor_info.model.service';
import { DoctorInfo } from './entity/doctor_info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorInfo])],
  providers: [DoctorInfoModelService],
  exports: [DoctorInfoModelService],
})
export class DoctorInfoModelModule {}
