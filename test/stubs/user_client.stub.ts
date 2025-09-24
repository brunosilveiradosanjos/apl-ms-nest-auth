// test/stubs/user-client.stub.ts
import { userStub } from './user.stub'

/**
 * Represents the shape of the user_clients junction table entity.
 * This ensures type safety for our test stubs.
 */
export interface UserClient {
  user_id: string
  client_id: string
  created_at: Date
}

/**
 * Provides a consistent, predictable stub for a user-client relationship.
 * It links the default user from `userStub` to the default client application
 * and includes a fixed timestamp for predictable test outcomes.
 */
export const userClientStub = (): UserClient => {
  return {
    user_id: userStub().id,
    client_id: '202509221000000000', // Default client_id from init.sql
    created_at: new Date('2025-09-22T10:00:00.000Z'),
  }
}
