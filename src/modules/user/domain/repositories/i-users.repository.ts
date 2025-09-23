import { User } from '../entities/user.entity'

export const IUsersRepository = Symbol('IUsersRepository')

export interface IUsersRepository {
  // Find a user only if they are associated with the given client
  findByClientIdAndUsernameOrEmail(clientId: string, identifier: string): Promise<User | null>
  // Associate a user with a client application
  associateWithClient(userId: string, clientId: string): Promise<void>
  findByUsername(username: string): Promise<User | null> // Keep for specific checks
  findByEmail(email: string): Promise<User | null> // Keep for specific checks
  findById(id: string): Promise<User | null>
  findAll(): Promise<User[]>
  create(user: Omit<User, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'is_verified' | 'last_login'>): Promise<User>
  update(id: string, data: Partial<Pick<User, 'first_name' | 'last_name'>>): Promise<User>
  delete(id: string): Promise<void>
  updateLastLogin(userId: string): Promise<void>
}
