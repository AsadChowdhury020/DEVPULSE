import { pool } from "../../database";
import type { IIssue } from "./issue.interface";

const createIssueIntoDB = async (payLoad: IIssue) => {
  const { title, description, type, reporter_id } = payLoad;

  const user = await pool.query(
    `
        SELECT id FROM users WHERE id = $1
        `,
    [reporter_id],
  );

  if (user.rows.length === 0) {
    throw new Error("Reporter not found");
  }
  const result = await pool.query(
    `
            INSERT INTO issues (title, description, type, reporter_id ) VALUES ($1, $2, $3, $4)

            RETURNING *
            `,
    [title, description, type, reporter_id],
  );

  return result;
};

// const getAllIssuesFromDB = async(filters: {
//         sort?: string;
//         type?: string;
//         status?: string;
//     }) => {
//     const { sort = "newest", type, status  } = filters
//     const result = await pool.query(`
//         SELECT * FROM issues
//         `)
//     return result
// }

const getAllIssuesFromDB = async (filters: {
  sort?: string;
  type?: string;
  status?: string;
}) => {
  const { sort = "newest", type, status } = filters;

  let query = `SELECT * FROM issues`;
  const values: string[] = [];
  const conditions: string[] = [];

  // Filter by type
  if (type) {
    conditions.push(`type = $${values.length + 1}`);
    values.push(type);
  }

  // Filter by status
  if (status) {
    conditions.push(`status = $${values.length + 1}`);
    values.push(status);
  }

  // Add WHERE clause
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Sorting
  if (sort === "oldest") {
    query += ` ORDER BY created_at ASC`;
  } else {
    query += ` ORDER BY created_at DESC`;
  }

  const result = await pool.query(query, values);

  return result;
};

const getAllIssuesCreatedByAnUserFromDB = async (reporterId: string) => {
  const result = await pool.query(
    `
        SELECT * FROM issues WHERE reporter_id = $1
        `,
    [reporterId],
  );
  return result;
};

const getSingleIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
        SELECT * FROM issues WHERE id = $1
        `,
    [id],
  );
  return result;
};

const updateIssueFromDB = async (
  id: string,
  payLoad: IIssue,
  reporterId: number,
  role: string,
) => {
  const { title, description, type, status } = payLoad;

  const issueData = await pool.query(
    `
        SELECT * FROM issues WHERE id = $1
        `,
    [id],
  );

  // console.log(issueData.rows[0])

  if (issueData.rows.length === 0) {
    throw new Error("Issue not found!!");
  }

  if (issueData.rows[0].status !== "open") {
    throw new Error("Cannot update resolved or in_progress issues");
  }

  const result = await pool.query(
    `
        UPDATE issues 
        SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        status = COALESCE($4, status),
        updated_at = NOW()

        WHERE id = $5
        RETURNING *

        `,
    [title, description, type, status, id],
  );

  return result;
};

const deleteIssueFromDB = async (id: string, reporterId: number) => {
  const issueData = await pool.query(
    `
        SELECT * FROM issues WHERE id = $1
        `,
    [id],
  );

  // console.log(issueData.rows[0])

  if (issueData.rows.length === 0) {
    throw new Error("Issue not found!!");
  }

  if (issueData.rows[0].reporter_id !== reporterId) {
    throw new Error("Forbidden!!");
  }

  const result = await pool.query(
    `
        DELETE FROM issues WHERE id = $1
        `,
    [id],
  );
  return result;
};

export const issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueFromDB,
  deleteIssueFromDB,
  getAllIssuesCreatedByAnUserFromDB,
};
