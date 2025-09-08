import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Company extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare employees: string

  @column()
  declare location: string

  @column()
  declare email: string

  @column()
  declare phone: string

  @column()
  declare address: string

  @column()
  declare dayValue: number;

  @column()
  declare monthValue: number

  @column()
  declare anualValue: number

  @column()
  declare leaveValue: number

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
