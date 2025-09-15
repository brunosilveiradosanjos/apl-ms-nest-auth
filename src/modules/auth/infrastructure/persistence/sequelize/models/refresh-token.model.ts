// src/modules/auth/infrastructure/persistence/sequelize/models/refresh-token.model.ts
import { Table, Column, Model, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { UserModel } from './user.model'

@Table({
  tableName: 'refresh_tokens',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
})
export class RefreshTokenModel extends Model {
  @PrimaryKey
  @Column
  declare id: string

  @ForeignKey(() => UserModel)
  @Column
  user_id: string

  @BelongsTo(() => UserModel)
  user: UserModel

  @Column
  token_hash: string

  @Column
  expires_at: Date

  @Column
  is_revoked: boolean
}
