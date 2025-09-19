import { Sequelize } from 'sequelize-typescript'
import { DatabaseHealthIndicator } from './database.health.indicator'

describe('DatabaseHealthIndicator', () => {
  let sequelize: Sequelize
  let indicator: DatabaseHealthIndicator

  beforeEach(() => {
    // Mock Sequelize
    sequelize = { query: jest.fn() } as any
    indicator = new DatabaseHealthIndicator(sequelize)
  })

  it('should return status "up" when database connection is successful', async () => {
    ;(sequelize.query as jest.Mock).mockResolvedValue(true)

    const result = await indicator.check()

    expect(result).toEqual({ name: 'database', status: 'up' })
    expect(sequelize.query).toHaveBeenCalledWith('SELECT 1')
  })

  it('should return status "down" with an error message on failure', async () => {
    const error = new Error('Connection failed')
    ;(sequelize.query as jest.Mock).mockRejectedValue(error)

    const result = await indicator.check()

    expect(result).toEqual({ name: 'database', status: 'down', error: 'Connection failed' })
    expect(sequelize.query).toHaveBeenCalledWith('SELECT 1')
  })
})
