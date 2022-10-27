import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entity/appointment.entity';
import { AppointmentModelService } from './appointment.model.service';
import { AppointmentUsers } from './entity/appointment_users.entity';
import { UserAppointments } from './entity/user_appointment.view.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, AppointmentUsers, UserAppointments]),
  ],
  providers: [AppointmentModelService],
  exports: [AppointmentModelService],
})
export class AppointmentModelModule {}
