import { Table, Column, Model, PrimaryKey, HasMany, DataType } from 'sequelize-typescript'
import { RefreshTokenModel } from './refresh-token.model'

@Table({ tableName: 'users', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class UserModel extends Model {
  @PrimaryKey
  @Column
  declare id: string

  @Column({ type: DataType.STRING(50), unique: true, allowNull: false })
  declare username: string

  @Column({ type: DataType.STRING(255), unique: true, allowNull: false })
  declare email: string

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare password_hash: string

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare first_name: string

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare last_name: string

  @Column({ type: DataType.BOOLEAN, defaultValue: true, allowNull: false })
  declare is_active: boolean

  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  declare is_verified: boolean

  @Column({ type: DataType.DATE, allowNull: true })
  declare last_login: Date

  @HasMany(() => RefreshTokenModel)
  refresh_tokens: RefreshTokenModel[]
}
