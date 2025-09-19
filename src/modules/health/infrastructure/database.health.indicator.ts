import { Injectable } from '@nestjs/common'
import { Sequelize } from 'sequelize-typescript'
import { HealthIndicator, HealthResult } from '../domain/health.indicator'

@Injectable()
export class DatabaseHealthIndicator implements HealthIndicator {
  constructor(private readonly sequelize: Sequelize) {}

  async check(): Promise<HealthResult> {
    try {
      await this.sequelize.query('SELECT 1')
      return { name: 'database', status: 'up' }
    } catch (error) {
      return {
        name: 'database',
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}
