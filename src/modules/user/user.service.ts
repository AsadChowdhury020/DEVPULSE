import { pool } from "../../database"
import type { IUser } from "./user.interface"

const createUserIntoDB =    async(payLoad : IUser) => {

    const { name, email, password } = payLoad
    const result = await pool.query(`
            INSERT INTO users (name, email, password) VALUES($1, $2, $3) 
            RETURNING *
            `, [name, email, password])

    return result
}

const getAllUsersFromDB = async() => {
    const result = await pool.query(`
            SELECT * FROM users
            `)
    return result
}

const getSingleUserFromDB = async(id : string) => {
      const result = await pool.query(`
            SELECT * FROM users WHERE id = $1
            `,[id])

    return result
}

const updateUserFromDB = async (payLoad : IUser, id : string) => {

    const { name, password, role } = payLoad
    const result = await pool.query(`
            UPDATE users 
            SET name = COALESCE( $1, name),
            password = COALESCE($2, password),
            role = COALESCE($3, role),
            updated_at = NOW()

            WHERE id = $4
            RETURNING *
            `,[name, password, role, id])
    return result
}

const deleteUserFromDB = async( id : string) => {
    const result = await await pool.query(`
            DELETE FROM users WHERE id = $1
            `,[id])
    return result
}

export const userService = {
    createUserIntoDB,
    getAllUsersFromDB,
    getSingleUserFromDB,
    updateUserFromDB,
    deleteUserFromDB
}