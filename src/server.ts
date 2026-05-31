import express, { type Application, type Request, type Response } from "express"
import {Pool} from "pg"
import config from "./config/dotenv"


const app : Application = express()
const port = config.port

app.use(express.json())

const pool = new Pool({
    connectionString : config.connection_string
})

const initDB = async () => {
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
initDB()



app.post('/users', async(req : Request, res : Response) => {
    const {name, email, password} = req.body

    try {

        const result = await pool.query(`
            INSERT INTO users (name, email, password) VALUES($1, $2, $3) 
            RETURNING *
            `, [name, email, password])
        res.status(201).json({
            success : true,
            message : "User created successfully!",
            data : result.rows[0]
        })
    } catch (error : any) {
        res.status(500).json({
            success : false,
            message : error.message,
            error : error
        })
    }
})

app.get('/users', async(req : Request, res : Response) => {
    try {
        const result = await pool.query(`
            SELECT * FROM users
            `)
        
            res.status(200).json({
            success : true,
            message : "Users retrived successfully!",
            data : result.rows
            })
    } catch (error : any) {
        res.status(500).json({
            success : false,
            message : error.message,
            error : error
        })
    }
})

app.get('/', (req : Request , res: Response ) => {
//   res.send('Hello World!!')
res.status(200).json({
    message : "Hello from DEVPULSE server!"
})
})

app.listen(port, () => {
  console.log(`DEVPULSE app listening on port ${port}`)
})