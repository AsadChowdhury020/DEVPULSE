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

app.get('/users/:id', async ( req:Request, res : Response) => {
    const { id } = req.params

    try {
        const result = await pool.query(`
            SELECT * FROM users WHERE id = $1
            `,[id])

        if(result.rows.length === 0){
            return res.status(404).json({
                success : false,
                message : "User not found",
                data : {}
            })
        }
        
        res.status(200).json({
            success : true,
            message : "User retrived successfully!",
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

app.put('/users/:id', async(req : Request, res : Response) => {
    const { id } = req.params


    try {
        const { name, password, role } = req.body
        const result = await pool.query(`
            UPDATE users 
            SET name = COALESCE( $1, name),
            password = COALESCE($2, password),
            role = COALESCE($3, role),
            updated_at = NOW()

            WHERE id = $4
            RETURNING *
            `,[name, password, role, id])

        if(result.rows.length === 0){
            return  res.status(404).json({
                success : false,
                message : "User not found!",
                data : {}
            })
        }

        res.status(200).json({
            success : true,
            message : "Users updated successfully!",
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

app.delete('/users/:id', async(req : Request, res : Response) => {
    const { id } = req.params

    try {
        const result = await pool.query(`
            DELETE FROM users WHERE id = $1
            `,[id])

        if(result.rowCount === 0) {
            return  res.status(404).json({
                success : false,
                message : "Users not found!",
                data : {}
            })
        }

         res.status(200).json({
            success : true,
            message : "Users deleted successfully!",
            })
        // console.log(result)
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