import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        name: 'default',
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT'), 10),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        synchronize: configService.get('DB_SYNC') === 'true' ? true : false,
        entities: [
          join(__dirname, '../../../models/**/entity/*.entity{.ts,.js}'),
        ],
        keepConnectionAlive: true,
        logging: configService.get('DB_LOG') === 'true' ? true : false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseConnectionModule {}
