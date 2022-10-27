import { Module } from '@nestjs/common';
import { UserModelService } from './user.model.service';
import { User } from './entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserModelService],
  exports: [UserModelService],
})
export class UserModelModule {}
