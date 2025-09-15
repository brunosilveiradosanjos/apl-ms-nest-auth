import { format } from 'date-fns'

/**
 * Generates a unique 20-character ID.
 * Format: yyyyMMddHHmmssSS (16 digits) + 4 random digits.
 * This is time-sortable and highly unlikely to collide.
 */
export function generateUniqueId(): string {
  const timestamp = format(new Date(), 'yyyyMMddHHmmssSS') // 16 characters
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString() // 4 digits
  return `${timestamp}${randomPart}`
}
