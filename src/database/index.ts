import { Pool } from "pg"
import config from "../config/dotenv"

export const pool = new Pool({
    connectionString : config.connection_string
})

export const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role VARCHAR(20) DEFAULT 'contributor' CHECK( role IN ('contributor', 'maintainer')),
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP DEFAULT NOW() NOT NULL
            )
            `)
    } catch (error) {
        console.log(error)
    }
}