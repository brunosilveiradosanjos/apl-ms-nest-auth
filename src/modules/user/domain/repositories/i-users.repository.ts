import { User } from '../entities/user.entity'

export const IUsersRepository = Symbol('IUsersRepository')

export interface IUsersRepository {
  // --- CHANGE: New method to find by either username or email ---
  findByUsernameOrEmail(identifier: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null> // Keep for specific checks
  findByEmail(email: string): Promise<User | null> // Keep for specific checks
  findById(id: string): Promise<User | null>
  create(user: Omit<User, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'is_verified' | 'last_login'>): Promise<User>
  updateLastLogin(userId: string): Promise<void>
}
