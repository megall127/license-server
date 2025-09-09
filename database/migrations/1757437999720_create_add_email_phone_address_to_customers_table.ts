import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'customers'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('email').nullable()
      table.string('phone').nullable()
      table.string('address').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('email')
      table.dropColumn('phone')
      table.dropColumn('address')
    })
  }
}