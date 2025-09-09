import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'schedules'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // Dados do cliente
      table.string('customer_name').notNullable()
      table.string('customer_phone').notNullable()
      table.string('customer_email').nullable()
      
      // Dados do serviço
      table.string('service_type').notNullable()
      table.text('service_description').notNullable()
      
      // Dados do agendamento
      table.date('scheduled_date').notNullable()
      table.time('scheduled_time').notNullable()
      table.integer('duration').notNullable().defaultTo(60) // em minutos
      
      // Status do agendamento
      table.enum('status', ['agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'])
        .defaultTo('agendado')
        .notNullable()
      
      // Observações
      table.text('notes').nullable()
      
      // Relacionamento com empresa
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