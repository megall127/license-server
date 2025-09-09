import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Company from './company.js'

export default class Schedule extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Dados do cliente
  @column()
  declare customerName: string

  @column()
  declare customerPhone: string

  @column()
  declare customerEmail: string | null

  // Dados do serviço
  @column()
  declare serviceType: string

  @column()
  declare serviceDescription: string

  // Dados do agendamento
  @column.date()
  declare scheduledDate: DateTime

  @column()
  declare scheduledTime: string

  @column()
  declare duration: number

  // Status do agendamento
  @column()
  declare status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado'

  // Observações
  @column()
  declare notes: string | null

  // Relacionamento com empresa
  @column()
  declare companyId: number

  @belongsTo(() => Company)
  declare company: BelongsTo<typeof Company>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}