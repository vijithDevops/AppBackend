import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarModelService } from './calendar.model.service';
import { Calendar } from './entity/calendar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Calendar])],
  providers: [CalendarModelService],
  exports: [CalendarModelService],
})
export class CalendarModelModule {}
