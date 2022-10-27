import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordChangeRequestModelService } from './password_change_request.model.service';
import { PasswordChangeRequest } from './entity/password_change_request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PasswordChangeRequest])],
  providers: [PasswordChangeRequestModelService],
  exports: [PasswordChangeRequestModelService],
})
export class PasswordChangeRequestModelModule {}
