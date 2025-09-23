import { Table, Column, Model, PrimaryKey, DataType, BelongsToMany } from 'sequelize-typescript'
import { UserModel } from '@/modules/user/infrastructure/persistence/sequelize/models/user.model'
import { UserClientModel } from '@/modules/user/infrastructure/persistence/sequelize/models/user-client.model'

@Table({ tableName: 'clients', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class ClientModel extends Model {
  @PrimaryKey
  @Column(DataType.STRING(20))
  declare id: string

  @Column({ type: DataType.STRING(100), unique: true, allowNull: false })
  declare name: string

  @Column(DataType.TEXT)
  declare description: string

  @BelongsToMany(() => UserModel, () => UserClientModel)
  users: UserModel[]
}
