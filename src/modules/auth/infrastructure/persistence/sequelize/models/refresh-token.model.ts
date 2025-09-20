import { Table, Column, Model, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { UserModel } from '@/modules/user/infrastructure/persistence/sequelize/models/user.model'

@Table({ tableName: 'refresh_tokens', timestamps: true, createdAt: 'created_at', updatedAt: false })
export class RefreshTokenModel extends Model {
  @PrimaryKey
  @Column
  declare id: string

  @ForeignKey(() => UserModel)
  @Column
  declare user_id: string

  @BelongsTo(() => UserModel)
  user: UserModel

  // --- FIX: Add the @Column decorator to each database field ---
  @Column
  declare token_hash: string

  @Column
  declare expires_at: Date

  @Column
  declare is_revoked: boolean
}
