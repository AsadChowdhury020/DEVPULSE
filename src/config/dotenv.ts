import dotenv from "dotenv"
import { access } from "fs"
import path from 'path'

dotenv.config({
    path : path.join(process.cwd(), ".env")
})

const config = {
    connection_string : process.env.CONNECTION_STRING as string,
    port : process.env.PORT, 
    secret : process.env.JWT_SECRET,
    access_secret : process.env.ACCESS_JWT_SECRET,
    access_token_expired_time : process.env.ACCESS_TOKEN_EXPIRED_TIME,
    refresh_token_expired_time : process.env.REFRESH_TOKEN_EXPIRED_TIME

}

export default config