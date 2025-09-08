import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'mysql',
  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
        host: process.env.MYSQLHOST || env.get('DB_HOST'),
        port: process.env.MYSQLPORT ? Number(process.env.MYSQLPORT) : Number(env.get('DB_PORT')),
        user: process.env.MYSQLUSER || env.get('DB_USER'),
        password: process.env.MYSQLPASSWORD || env.get('DB_PASSWORD'),
        database: process.env.MYSQLDATABASE || env.get('DB_DATABASE'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig