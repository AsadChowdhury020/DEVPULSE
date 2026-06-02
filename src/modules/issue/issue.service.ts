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

export const issueService = {
    createIssueIntoDB
}