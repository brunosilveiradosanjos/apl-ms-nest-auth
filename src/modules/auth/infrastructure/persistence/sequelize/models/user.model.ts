// src/modules/auth/infrastructure/persistence/sequelize/models/user.model.ts
import { Table, Column, Model, PrimaryKey, HasMany } from 'sequelize-typescript'
import { RefreshTokenModel } from './refresh-token.model'

@Table({
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class UserModel extends Model {
  @PrimaryKey
  @Column
  declare id: string

  @Column
  username: string

  @Column
  password_hash: string

  @HasMany(() => RefreshTokenModel)
  refresh_tokens: RefreshTokenModel[]
}
