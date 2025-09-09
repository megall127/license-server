import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Employee extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare phone: string | null

  @column()
  declare position: string

  @column()
  declare companyId: number

  @column()
  declare salary: number

  @column.date()
  declare hireDate: DateTime | null

  @column()
  declare status: 'ativo' | 'inativo'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relacionamento com Company
  @belongsTo(() => {
    const { default: Company } = require('./company.js')
    return Company
  })
  declare company: BelongsTo<typeof import('./company.js').default>
}