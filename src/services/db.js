import pg from 'pg'

let connection = null

const pool = new pg.Pool({
  user: process.env.PG_USER ?? 'postgres',
  host: process.env.PG_HOST ?? 'localhost',
  database: process.env.PG_DATABASE ?? 'miniature',
  password: process.env.PG_PASSWORD ?? 'postgres',
  port: process.env.PG_PORT ?? 5432
})

/**
 * Connect and/or reuse existing connection
 * @returns Promise<PoolClient | null>
 */
export default async function connect() {
  if(!connection) {
    connection = await pool.connect()
  }
  return connection
}
