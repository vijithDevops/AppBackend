import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewayModelService } from './gateway.model.service';
import { Gateway } from './entity/gateway.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gateway])],
  providers: [GatewayModelService],
  exports: [GatewayModelService],
})
export class GatewayModelModule {}
