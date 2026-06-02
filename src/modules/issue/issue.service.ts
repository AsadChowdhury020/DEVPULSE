import { pool } from "../../database"
import type { IIssue } from "./issue.interface"

const createIssueIntoDB = async ( payLoad : IIssue) => {

    const { title, description, type, reporter_id} = payLoad

    const user = await pool.query(`
        SELECT id FROM users WHERE id = $1
        `, [reporter_id])

    if(user.rows.length === 0){
        throw new Error("Reporter not found")
    }
    const result = await pool.query(`
            INSERT INTO issues (title, description, type, reporter_id ) VALUES ($1, $2, $3, $4)

            RETURNING *
            `, [title, description, type, reporter_id])


    return result

}

const getAllIssuesFromDB = async() => {
    const result = pool.query(`
        SELECT * FROM issues
        `)
    return result
}

const getSingleIssueFromDB = async(id : string) => {
    const result = await pool.query(`
        SELECT * FROM issues WHERE id = $1
        `,[id])
    return result
}

const updateIssueFromDB = async(id : string, payLoad : IIssue) => {

    const { title, description, type, status, reporter_id} = payLoad
    // const user = await pool.query(`
    //     SELECT * FROM users WHERE id = $1
    //     `,[reporter_id])
    // if(user.rows.length === 0){
    //     throw new Error('Reporter not found!')
    // }

    const result = await pool.query(`
        UPDATE issues 
        SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        status = COALESCE($4, status),
        updated_at = NOW()

        WHERE id = $5
        RETURNING *

        `,[title, description, type, status, id])
    
    return result
}

const deleteUserFromDB = async (id : string) =>{
    const result = await pool.query(`
        DELETE FROM issues WHERE id = $1
        `,[id])
    return result
}

export const issueService = {
    createIssueIntoDB,
    getAllIssuesFromDB,
    getSingleIssueFromDB,
    updateIssueFromDB,
    deleteUserFromDB
}