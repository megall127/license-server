import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'employees'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 255).notNullable()
      table.string('email', 255).notNullable().unique()
      table.string('phone', 20).nullable()
      table.string('position', 100).notNullable()
      table.integer('company_id').unsigned().notNullable()
      table.decimal('salary', 10, 2).defaultTo(0)
      table.date('hire_date').nullable()
      table.enum('status', ['ativo', 'inativo']).defaultTo('ativo')
      
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())

      // Foreign key constraint
      table.foreign('company_id').references('id').inTable('companies').onDelete('CASCADE')
      
      // Indexes
      table.index(['company_id'])
      table.index(['email'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}