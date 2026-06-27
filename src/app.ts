import express, { type Application, type Request, type Response } from "express"
import { userRoute } from "./modules/user/user.route"
import { issueRoute } from "./modules/issue/issue.router"
import { authRoute } from "./modules/auth/auth.route"
import { logger } from "./middleware/logger"
import  cookieParser from 'cookie-parser'
import cors from 'cors'
import { globalErrorHandler } from "./middleware/globalErrorHandler"
import { sendResponse } from "./utility/sendResponse"

const app : Application = express()

const corsOptions = {
  origin: 'http://localhost:3000'
}

app.use(express.json())
app.use(logger)
app.use(cookieParser())
app.use(cors(corsOptions))

app.use('/users', userRoute)
app.use('/issue', issueRoute)
app.use('/api/login', authRoute)

app.get('/', (req : Request , res: Response ) => {
    // res.send('Hello World!!')
    // res.status(200).json({
    // success: true,
    // message : "Hello from DEVPULSE server!"
// })
    sendResponse(res, {
      statusCode : 200,
      success: true,
      message : "Hello from DEVPULSE server!"
    })
})

// Global Error Handling Middleware
app.use(globalErrorHandler);
export default app