import { pool } from "../../db";
import type { CreateIssuePayload, Issue, IssueQuery, IssueWithReporter, Reporter } from "./issue.interface";

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

const getAllIssuesFromDB = async (query: IssueQuery): Promise<IssueWithReporter[]> => {
    const conditions: string[] = []
    const values: unknown[] = []

    if (query.type) {
        values.push(query.type)
        conditions.push(`type = $${values.length}`)
    }

    if (query.status) {
        values.push(query.status)
        conditions.push(`status = $${values.length}`)
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const orderDirection = query.sort === "oldest" ? "ASC" : "DESC"

    const issueResult = await pool.query<Issue>(
        `
        SELECT id, title, description, type, status, reporter_id, created_at, updated_at
        FROM issues
        ${whereClause}
        ORDER BY created_at ${orderDirection}
        `, values)

    const issues = issueResult.rows

    if (issues.length === 0) {
        return []
    }

    const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))]

    const placeholders = reporterIds
        .map((_, index) => `$${index + 1}`)
        .join(", ")

    const reporterResult = await pool.query<Reporter>(
        `
        SELECT id, name, role FROM users WHERE id IN (${placeholders})
        `,
        reporterIds
    )

    const reporterMap = new Map<number, Reporter>()

    reporterResult.rows.forEach((reporter) => {
        reporterMap.set(reporter.id, reporter)
    })

    return issues.map((issue) => {
        const reporter = reporterMap.get(issue.reporter_id)

        if (!reporter) {
            throw new Error(`Reporter not found for issue ${issue.id}`)
        }

        return {
            id: issue.id,
            title: issue.title,
            description: issue.description,
            type: issue.type,
            status: issue.status,
            reporter,
            created_at: issue.created_at,
            updated_at: issue.updated_at
        }
    })
}

const getSingleIssueFromDB = async (
    issueId: number
): Promise<IssueWithReporter | null> => {
    const issueResult = await pool.query<Issue>(`
        SELECT id, title, description, type, status, reporter_id, created_at, updated_at
        FROM issues
        WHERE id = $1
        `, [issueId])

    const issue = issueResult.rows[0]

    if (!issue) {
        return null
    }

    const reporterResult = await pool.query<Reporter>(`
        SELECT id, name, role
        FROM users
        WHERE id = $1
        `, [issue.reporter_id])

    const reporter = reporterResult.rows[0]

    if (!reporter) {
        throw new Error(`Reporter not found for issue ${issue.id}`)
    }

    return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
    };
};

export const issueService = { createIssueIntoDB, getAllIssuesFromDB, getSingleIssueFromDB }