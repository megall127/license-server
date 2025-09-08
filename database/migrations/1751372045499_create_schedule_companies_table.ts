import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'schedule_companies'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.string('date_init').notNullable()
      table.string('date_end')

      table
      .integer('customers_id') 
      .unsigned()
      .references('id')
      .inTable('customers')
      .onDelete('CASCADE')

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