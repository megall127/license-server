import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 254).notNullable().unique()
      table.string('internal_cod').unique()
      table.string('barcode')
      table.float('amount').notNullable()
      table.float('min_amount')
      table.float('value_sell').notNullable()
      table.float('value_coast').notNullable()
      table.string('supplier')
      table.string('type').notNullable()
      table.string('observation')

      table
        .integer('company_id') 
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('companies')
        .onDelete('CASCADE')

        table.timestamp('created_at').defaultTo(this.now()) 
        table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
