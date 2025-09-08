import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Company from './company.js'
import Product from './product.js'

export default class TransitionsBuySells extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare productId: number

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @column()
  declare companyId: number

  @belongsTo(() => Company)
  declare company: BelongsTo<typeof Company>

  @column()
  declare transactionType: 'entrada' | 'saida'

  @column()
  declare amount: number

  @column()
  declare quantity: number

  @column()
  declare description: string | null

  @column()
  declare paymentMethod: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia'

  @column()
  declare status: 'pendente' | 'confirmado' | 'cancelado'

  @column()
  declare customerName: string | null

  @column()
  declare customerDocument: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}