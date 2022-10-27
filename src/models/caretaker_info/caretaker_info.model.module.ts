import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaretakerInfoModelService } from './caretaker_info.model.service';
import { CaretakerInfo } from './entity/caretaker_info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CaretakerInfo])],
  providers: [CaretakerInfoModelService],
  exports: [CaretakerInfoModelService],
})
export class CaretakerInfoModelModule {}
