import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'mysql',
  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
        host: process.env.MYSQLHOST || env.get('MYSQLHOST'),
        port: process.env.MYSQLPORT ? Number(process.env.MYSQLPORT) : Number(env.get('MYSQLPORT')),
        user: process.env.MYSQLUSER || env.get('MYSQLUSER'),
        password: process.env.MYSQLPASSWORD || env.get('MYSQLPASSWORD'),
        database: process.env.MYSQLDATABASE || env.get('MYSQLDATABASE'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig