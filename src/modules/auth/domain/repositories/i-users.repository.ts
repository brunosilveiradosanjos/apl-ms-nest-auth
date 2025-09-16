import { User } from '@/modules/auth/domain/entities/user.entity'

export const IUsersRepository = Symbol('IUsersRepository')

export interface IUsersRepository {
  findByUsername(username: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User>
}
