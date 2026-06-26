import type { NextFunction, Request, Response } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"
import config from "../config/dotenv"
import { pool } from "../database"
import type { ROLES } from "../types/index.role"

export const auth = (... roles : ROLES[]) => {
    return async(req : Request, res : Response, next : NextFunction) => {

    try {

        const token = req.headers.authorization
        
        if(!token){
            return res.status(401).json({
                success : false,
                message : "Unauthorized access!!"
            })
        }

        const decode = jwt.verify(token as string, config.secret as string) as JwtPayload
        // console.log(decode)
        
        const userData = await pool.query(`
            SELECT * FROM users WHERE email = $1
            `, [decode.email])

        // console.log(userData.rows[0])
        const user = userData.rows[0]
        
        // console.log(user.role)

        if(userData.rows.length === 0){
            return res.status(404).json({
                success : false,
                message : "User not found!!"
            })
        }

        // if(!(user.role === "maintainer")){
        //     return res.status(403).json({
        //         success : false,
        //         message : "Forbidden!!"
        //     })
        // }

        if(roles.length && !roles.includes(user.role)){
            return res.status(403).json({
                success : false,
                message : `Forbidden!! This role has no access`
            })
        }

        // Set user into request
        req.user = decode
        next()
    } catch (error) {
        next(error)
    }
    }
}