import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorModelService } from './sensor.model.service';
import { Sensor } from './entity/sensor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sensor])],
  providers: [SensorModelService],
  exports: [SensorModelService],
})
export class SensorModelModule {}
