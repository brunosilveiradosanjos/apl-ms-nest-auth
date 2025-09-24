import { Table, Column, Model, PrimaryKey, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript'
import { UserModel } from '@/modules/user/infrastructure/persistence/sequelize/models/user.model'
import { ClientModel } from '@/modules/client/infrastructure/persistence/sequelize/models/client.model'

@Table({ tableName: 'refresh_tokens', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class RefreshTokenModel extends Model {
  @PrimaryKey
  @Column(DataType.STRING(20))
  declare id: string

  @ForeignKey(() => UserModel)
  @Column(DataType.STRING(20))
  declare user_id: string

  @BelongsTo(() => UserModel)
  user: UserModel

  // --- FIX: Add the client_id column and its relationship ---
  @ForeignKey(() => ClientModel)
  @Column({ type: DataType.STRING(20), allowNull: false })
  declare client_id: string

  @BelongsTo(() => ClientModel)
  client: ClientModel
  // ---------------------------------------------------------

  @Column(DataType.TEXT)
  declare token_hash: string

  @Column(DataType.DATE)
  declare expires_at: Date

  @Column(DataType.BOOLEAN)
  declare is_revoked: boolean
}
