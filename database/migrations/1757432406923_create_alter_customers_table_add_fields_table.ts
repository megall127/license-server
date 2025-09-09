import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'alter_customers_table_add_fields'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.timestamp('created_at').nullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}