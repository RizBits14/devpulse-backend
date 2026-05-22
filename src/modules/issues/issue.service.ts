import { pool } from "../../db";
import type { CreateIssuePayload, Issue } from "./issue.interface";

const createIssueIntoDB = async (payload: CreateIssuePayload, reporterId: number): Promise<Issue> => {
    const { title, description, type } = payload

    const result = await pool.query<Issue>(`
        INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4)
        RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
        `, [title, description, type, reporterId])

    const issue = result.rows[0]

    if (!issue) {
        throw new Error('Issue creation failed')
    }

    return issue
}

export const issueService = { createIssueIntoDB }