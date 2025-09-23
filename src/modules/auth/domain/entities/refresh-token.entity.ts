export class RefreshToken {
  id: string
  user_id: string
  client_id: string
  token_hash: string
  expires_at: Date
  is_revoked: boolean
  created_at?: Date
  updated_at?: Date
}
