export interface HealthResult {
  name: string
  status: 'up' | 'down'
  error?: string
}

export abstract class HealthIndicator {
  abstract check(): Promise<HealthResult>
}
