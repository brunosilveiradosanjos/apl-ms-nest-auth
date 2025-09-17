export class User {
  id: string
  username: string
  email: string
  password_hash: string
  first_name?: string | null
  last_name?: string | null
  is_active: boolean
  is_verified: boolean
  last_login?: Date | null
}
