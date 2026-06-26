import type { NextFunction, Request, Response } from "express";
import fs from "fs"

export const logger = (req : Request, res : Response, next : NextFunction) => {

    const log = `\n\nMethod: ${req.method} - URL : ${req.url} - Time : ${Date.now()}`
    fs.appendFile("logger.txt", log, (error) => {
        if(error){
            console.log(error)
        }
    })
    next()
}