import express, { type Application, type Request, type Response } from "express"
import { userRoute } from "./modules/user/user.route"
import { issueRoute } from "./modules/issue/issue.router"
import { authRoute } from "./modules/auth/auth.route"
import { logger } from "./middleware/logger"


const app : Application = express()


app.use(express.json())
app.use(logger)

app.use('/users', userRoute)
app.use('/issue', issueRoute)
app.use('/api/login', authRoute)

app.get('/', (req : Request , res: Response ) => {
//   res.send('Hello World!!')
res.status(200).json({
    message : "Hello from DEVPULSE server!"
})
})

export default app