import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transitions_buy_sells'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Adicionar novos campos para melhor controle do fluxo de caixa
      table.enum('transaction_type', ['entrada', 'saida']).defaultTo('entrada')
      table.decimal('amount', 10, 2).notNullable().defaultTo(0)
      table.integer('quantity').notNullable().defaultTo(1)
      table.string('description', 255).nullable()
      table.enum('payment_method', ['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia']).defaultTo('dinheiro')
      table.enum('status', ['pendente', 'confirmado', 'cancelado']).defaultTo('confirmado')
      table.string('customer_name', 100).nullable()
      table.string('customer_document', 20).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('transaction_type')
      table.dropColumn('amount')
      table.dropColumn('quantity')
      table.dropColumn('description')
      table.dropColumn('payment_method')
      table.dropColumn('status')
      table.dropColumn('customer_name')
      table.dropColumn('customer_document')
    })
  }
}
