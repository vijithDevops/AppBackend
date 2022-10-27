import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NonMedicalNotification } from './entity/non_medical_notification.entity';
import { NonMedicalNotificationModelService } from './non_medical_notification.model.service';

@Module({
  imports: [TypeOrmModule.forFeature([NonMedicalNotification])],
  providers: [NonMedicalNotificationModelService],
  exports: [NonMedicalNotificationModelService],
})
export class NonMedicalNotificationModelModule {}
