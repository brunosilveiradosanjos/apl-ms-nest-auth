import { User } from '@/modules/user/domain/entities/user.entity'
import { Role } from '@/modules/user/domain/enums/role.enum'

export const userStub = (): User => {
  return {
    id: '202509151645001234',
    username: 'johndoe',
    email: 'john.doe@example.com',
    password_hash: '$2a$10$AbI.jott.p2y1iK5lBGA7u/GvV.L03PlzV5isg5vYL.g09S9Zg9eS',
    first_name: 'John',
    last_name: 'Doe',
    is_active: true,
    is_verified: true,
    last_login: new Date('2025-09-22T14:28:16.390Z'),
    role: Role.User,
  }
}
