import dotenv from "dotenv"
import { access } from "fs"
import path from 'path'

dotenv.config({
    path : path.join(process.cwd(), ".env")
})

const config = {
    connection_string : process.env.CONNECTION_STRING as string,
    port : process.env.PORT, 
    access_secret : process.env.JWT_ACCESS_SECRET,
    refresh_secret : process.env.JWT_REFRESH_SECRET,
    access_token_expires_in : process.env.ACCESS_TOKEN_EXPIRES_IN as string,
    refresh_token_expires_in : process.env.REFRESH_TOKEN_EXPIRES_IN
}

export default config