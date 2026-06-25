import bcrypt from "bcryptjs"
import { pool } from "../../database"
import type { IAuth } from "./auth.interface"
import jwt from "jsonwebtoken"
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

    const accessToken = jwt.sign(jwtPayLoad, config.secret as string, {expiresIn : "1d"} )

    return { accessToken }
}

export const authService = {
    loginUserFromDB
}