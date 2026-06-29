import bcrypt from "bcryptjs"
import { pool } from "../../database"
import type { IAuth } from "./auth.interface"
import jwt, { type JwtPayload } from "jsonwebtoken"
import config from "../../config/dotenv"

const loginUserFromDB = async(payLoad : IAuth) => {
    const { email, password } = payLoad

    const userData = await pool.query(`
        SELECT * FROM users WHERE email = $1
        `, [email]) 

    if(userData.rows.length === 0){
        throw new Error("Invalid credential!!")
    }
    const user = userData.rows[0]
    // console.log(user)

    const matchPassword = await bcrypt.compare(password, user.password)
    // console.log(matchPassword)

    if(!matchPassword){
        throw new Error("Invalid credential!!")
    }

    const jwtPayLoad = {
        id : user.id,
        name : user.name,
        email : user.email,
        role : user.role
    } 

    const accessToken = jwt.sign(jwtPayLoad, config.access_secret as string, {expiresIn : "1d"})
    const refreshToken = jwt.sign(jwtPayLoad, config.refresh_secret as string, {expiresIn : "10d"})

    return { accessToken, refreshToken }
}

const generateRefreshTokenFromDB = async(token : string) => {
     if(!token){
            throw new Error( "Unauthorized access!!")
        }

        const decode = jwt.verify(token as string, config.refresh_secret as string) as JwtPayload
        // console.log(decode)
        
        const userData = await pool.query(`
            SELECT * FROM users WHERE email = $1
            `, [decode.email])

        // console.log(userData.rows[0])
        const user = userData.rows[0]
        
        // console.log(user.role)

        if(userData.rows.length === 0){
          throw new Error("User not found!!")
        }

        const jwtPayLoad = {
        id : user.id,
        name : user.name,
        email : user.email,
        role : user.role
    } 


        const accessToken = jwt.sign(jwtPayLoad, config.access_secret as string, {expiresIn : "1d"})

    return { accessToken }

}

export const authService = {
    loginUserFromDB,
    generateRefreshTokenFromDB
}