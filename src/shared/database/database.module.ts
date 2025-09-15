// src/shared/database/database.module.ts
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize'
import { databaseConfig } from './database.config'

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      useFactory: (config: ConfigService) => config.getOrThrow<SequelizeModuleOptions>('database'),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
