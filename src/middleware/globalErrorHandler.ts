import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utility/sendResponse";

// Global Error Handling Middleware
export const globalErrorHandler =  (err : any, req : Request, res : Response, next : NextFunction) => {
  console.error(err.stack);

  // res.status(500).json({
  //   success: false,
  //   message: err.message || "Internal Server Error",
  // });
  sendResponse(res, {
                statusCode : 500,
                success: false,
                message : err.message || "Internal Server Error"
            })
}