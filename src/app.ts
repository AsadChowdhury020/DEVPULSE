import express, { type Application, type Request, type Response } from "express"
import { userRoute } from "./modules/user/user.route"


const app : Application = express()


app.use(express.json())


app.use('/users', userRoute)


app.get('/', (req : Request , res: Response ) => {
//   res.send('Hello World!!')
res.status(200).json({
    message : "Hello from DEVPULSE server!"
})
})

export default app