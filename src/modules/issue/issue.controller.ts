import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import { userService } from "../user/user.service";
import { sendResponse } from "../../utility/sendResponse";

const createIssue = async ( req : Request, res : Response) =>{
    // const { title, description, type, reporter_id} = req.body

    try {
        const result = await issueService.createIssueIntoDB(req.body)

        // res.status(201).json({
        //     success : true,
        //     message : "Issue created successfully!",
        //     data : result.rows
        // })
        sendResponse(res, {
                        statusCode : 201,
                        success: true,
                        message : "Issue created successfully!",
                        data : result.rows
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

const getAllIssues = async(req : Request, res : Response) => {
    try {
        const result = await issueService.getAllIssuesFromDB()

        // res.status(200).json({
        //     success : true,
        //     message : "Issues retrived successfully",
        //     data : result.rows
        // })
        sendResponse(res, {
                statusCode : 200,
                success: true,
                message : "Issues retrived successfully",
                data : result.rows
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

const getSingleIssue = async( req : Request, res : Response) => {

    const { id } = req.params
    // console.log(id)
    try {
        const result = await issueService.getSingleIssueFromDB(id as string)

        if(result.rows.length === 0){
        //  return res.status(404).json({
        //         success : false,
        //         message : "Issue not found!"
        // })
            return sendResponse(res, {
                statusCode : 500,
                success: false,
                message : "Issue not found!"
            })
        }

        // res.status(200).json({
        //     success : true,
        //     message : "Issue retrived successfully",
        //     data : result.rows
        // })
        sendResponse(res, {
                statusCode : 200,
                success: true,
                message : "Issue retrived successfully",
                data : result.rows
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

const updateIssue = async( req : Request, res : Response) =>{
    const { id } = req.params
    try {
        const result = await issueService.updateIssueFromDB(id as string, req.body)

        if(result.rows.length === 0){
        //     return res.status(404).json({
        //         success : false,
        //         message : "Issue not found!",
        //         data : {}
        // })
            return sendResponse(res, {
                statusCode : 404,
                success: false,
                message : "Issue not found!",
                data : {}
            })
        }

        // res.status(200).json({
        //     success : true,
        //     message : "Issue updated successfully",
        //     data : result.rows
        // })
        sendResponse(res, {
                statusCode : 200,
                success: true,
                message : "Issue updated successfully",
                data : result.rows
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

const deleteIssue = async( req : Request, res : Response) =>{
    const { id } = req.params

    try {

        const result = await issueService.deleteUserFromDB(id as string)
        if(result.rowCount === 0){
        //     return res.status(404).json({
        //         success : false,
        //         message : "Issue not found"
        // })
        return sendResponse(res, {
                statusCode : 404,
                success: false,
                message : "Issue not found!"
            })
        }
        // res.status(200).json({
        //     success : true,
        //     message : "Issue deleted successfully",
        //     data : {}
        // })
        sendResponse(res, {
                statusCode : 200,
                success: true,
                message : "Issue deleted successfully",
                data : {}
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
export const issueController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue 
}