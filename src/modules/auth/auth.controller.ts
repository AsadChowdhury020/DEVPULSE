import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { CLIENT_RENEG_LIMIT } from "tls";
import { sendResponse } from "../../utility/sendResponse";

const loginUser = async(req : Request, res : Response ) => {

    try {
        
        const result = await authService.loginUserFromDB(req.body)

        const { refreshToken } = result

        res.cookie("refreshToken", refreshToken, {
            secure : false, // In production => true,
            httpOnly : true,
            sameSite : 'lax'

        })
        // res.status(200).json({
        //     success : true,
        //     message : "Access token generated successfully!",
        //     data : result
        //     })
        sendResponse(res, {
                statusCode : 200,
                success: true,
                message : "Access token generated successfully!",
                data : result
            })
    } catch (error : any) {
        // res.status(500).json({
        //     success : false,
        //     message : error.message,
        //     error : error
        // })
        sendResponse(res, {
                statusCode : 500,
                success: false,
                message : error.message,
                error : error
            })
    }
}

const generateRefreshToken = async( req : Request, res : Response) => {
    try {
        
        const result = await authService.generateRefreshTokenFromDB(req.cookies.refreshToken)

        // res.status(200).json({
        //     success : true,
        //     message : "Access token generated successfully!",
        //     data : result
        //     })
        sendResponse(res, {
                statusCode : 200,
                success: true,
                message : "Access token generated successfully!",
                data : result
            })
    } catch (error : any) {
        // res.status(500).json({
        //     success : false,
        //     message : error.message,
        //     error : error
        // })
        sendResponse(res, {
                statusCode : 500,
                success: false,
                message : error.message,
                error : error
            })
    }
}
export const authController = {
    loginUser,
    generateRefreshToken
}