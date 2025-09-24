import { Table, Column, Model, ForeignKey, PrimaryKey } from 'sequelize-typescript'
import { UserModel } from './user.model'
import { ClientModel } from '@/modules/client/infrastructure/persistence/sequelize/models/client.model'

@Table({ tableName: 'user_clients', timestamps: true, createdAt: 'created_at', updatedAt: false })
export class UserClientModel extends Model {
  @PrimaryKey
  @ForeignKey(() => UserModel)
  @Column
  declare user_id: string

  @PrimaryKey
  @ForeignKey(() => ClientModel)
  @Column
  declare client_id: string
}
