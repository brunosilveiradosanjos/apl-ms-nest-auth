import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { ClientModel } from './infrastructure/persistence/sequelize/models/client.model'

@Module({
  imports: [SequelizeModule.forFeature([ClientModel])],
  exports: [SequelizeModule], // Export so other modules can use ClientModel
})
export class ClientModule {}
