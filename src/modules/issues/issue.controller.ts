import type { Request, Response } from "express";
import sendErrorResponse from "../../utils/sendErrorResponse";
import sendResponse from "../../utils/sendResponse";
import type { IssueQuery } from "./issue.interface";
import { issueService } from "./issue.service";

const createIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, type } = req.body || {}

        if (!req.user) {
            sendErrorResponse(
                res,
                401,
                'Unauthorized access',
                'User information is missing from token'
            )
            return
        }

        if (!title || !description || !type) {
            sendErrorResponse(res, 400, 'Title, description and type are required')
            return
        }

        if (title.length > 150) {
            sendErrorResponse(res, 400, 'Title must not exceed 150 characters')
            return
        }

        if (description.length < 20) {
            sendErrorResponse(
                res,
                400,
                'Description must be at least 20 characters long'
            )
            return
        }

        if (type !== 'bug' && type !== 'feature_request') {
            sendErrorResponse(res, 400, 'Type must be bug or feature_request')
            return
        }

        const issue = await issueService.createIssueIntoDB(
            {
                title,
                description,
                type,
            },
            req.user.id
        )

        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'Issue created successfully',
            data: issue,
        })
    } catch (error) {
        sendErrorResponse(
            res,
            500,
            'Issue creation failed',
            error instanceof Error ? error.message : 'Unknown error'
        )
    }
}

const getAllIssues = async (req: Request, res: Response): Promise<void> => {
    try {
        const sortValue =
            typeof req.query.sort === 'string' ? req.query.sort : undefined

        const typeValue =
            typeof req.query.type === 'string' ? req.query.type : undefined

        const statusValue =
            typeof req.query.status === 'string' ? req.query.status : undefined

        if (sortValue && sortValue !== 'newest' && sortValue !== 'oldest') {
            sendErrorResponse(res, 400, 'Sort must be newest or oldest')
            return
        }

        if (typeValue && typeValue !== 'bug' && typeValue !== 'feature_request') {
            sendErrorResponse(res, 400, 'Type must be bug or feature_request')
            return
        }

        if (
            statusValue &&
            statusValue !== 'open' &&
            statusValue !== 'in_progress' &&
            statusValue !== 'resolved'
        ) {
            sendErrorResponse(
                res,
                400,
                'Status must be open, in_progress or resolved'
            )
            return
        }

        const query: IssueQuery = {}

        if (sortValue === 'newest' || sortValue === 'oldest') {
            query.sort = sortValue
        }

        if (typeValue === 'bug' || typeValue === 'feature_request') {
            query.type = typeValue
        }

        if (
            statusValue === 'open' ||
            statusValue === 'in_progress' ||
            statusValue === 'resolved'
        ) {
            query.status = statusValue
        }

        const issues = await issueService.getAllIssuesFromDB(query)

        sendResponse(res, {
            statusCode: 200,
            success: true,
            data: issues,
        })
    } catch (error) {
        sendErrorResponse(
            res,
            500,
            'Failed to retrieve issues',
            error instanceof Error ? error.message : 'Unknown error'
        )
    }
}

const getSingleIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const issueId = Number(req.params.id)

        if (!Number.isInteger(issueId) || issueId <= 0) {
            sendErrorResponse(res, 400, 'Issue id must be a valid positive number')
            return
        }

        const issue = await issueService.getSingleIssueFromDB(issueId)

        if (!issue) {
            sendErrorResponse(res, 404, 'Issue not found')
            return
        }

        sendResponse(res, {
            statusCode: 200,
            success: true,
            data: issue,
        })
    } catch (error) {
        sendErrorResponse(
            res,
            500,
            'Failed to retrieve issue',
            error instanceof Error ? error.message : 'Unknown error'
        )
    }
}

const updateIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const issueId = Number(req.params.id)

        if (!Number.isInteger(issueId) || issueId <= 0) {
            sendErrorResponse(res, 400, 'Issue id must be a valid positive number')
            return
        }

        if (!req.user) {
            sendErrorResponse(
                res,
                401,
                'Unauthorized access',
                'User information is missing from token'
            )
            return
        }

        const existingIssue = await issueService.getRawIssueByIdFromDB(issueId)

        if (!existingIssue) {
            sendErrorResponse(res, 404, 'Issue not found')
            return
        }

        const isMaintainer = req.user.role === 'maintainer'
        const isOwnIssue = existingIssue.reporter_id === req.user.id

        if (!isMaintainer && !isOwnIssue) {
            sendErrorResponse(
                res,
                403,
                'Forbidden access',
                'You can only update your own issue'
            )
            return
        }

        if (!isMaintainer && existingIssue.status !== 'open') {
            sendErrorResponse(
                res,
                409,
                'Only open issues can be updated by contributor'
            )
            return
        }

        const { title, description, type, status } = req.body || {}

        if (
            title === undefined &&
            description === undefined &&
            type === undefined &&
            status === undefined
        ) {
            sendErrorResponse(res, 400, 'At least one field is required for update')
            return
        }

        if (title !== undefined && title.length > 150) {
            sendErrorResponse(res, 400, 'Title must not exceed 150 characters')
            return
        }

        if (description !== undefined && description.length < 20) {
            sendErrorResponse(
                res,
                400,
                'Description must be at least 20 characters long'
            )
            return
        }

        if (type !== undefined && type !== 'bug' && type !== 'feature_request') {
            sendErrorResponse(res, 400, 'Type must be bug or feature_request')
            return
        }

        if (
            status !== undefined &&
            status !== 'open' &&
            status !== 'in_progress' &&
            status !== 'resolved'
        ) {
            sendErrorResponse(
                res,
                400,
                'Status must be open, in_progress or resolved'
            )
            return
        }

        if (!isMaintainer && status !== undefined) {
            sendErrorResponse(
                res,
                403,
                'Forbidden access',
                'Only maintainer can update issue status'
            )
            return
        }

        const updatedIssue = await issueService.updateIssueIntoDB(issueId, {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(type !== undefined && { type }),
            ...(status !== undefined && { status })
        })

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Issue updated successfully',
            data: updatedIssue,
        })
    } catch (error) {
        sendErrorResponse(
            res,
            500,
            'Issue update failed',
            error instanceof Error ? error.message : 'Unknown error'
        )
    }
}

const deleteIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const issueId = Number(req.params.id)

        if (!Number.isInteger(issueId) || issueId <= 0) {
            sendErrorResponse(res, 400, 'Issue id must be a valid positive number')
            return
        }

        const isDeleted = await issueService.deleteIssueFromDB(issueId)

        if (!isDeleted) {
            sendErrorResponse(res, 404, 'Issue not found')
            return
        }

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Issue deleted successfully',
        })
    } catch (error) {
        sendErrorResponse(
            res,
            500,
            'Issue deletion failed',
            error instanceof Error ? error.message : 'Unknown error'
        )
    }
}

const getIssueMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
        const metrics = await issueService.getIssueMetricsFromDB()

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Issue metrics retrieved successfully',
            data: metrics,
        })
    } catch (error) {
        sendErrorResponse(
            res,
            500,
            'Failed to retrieve issue metrics',
            error instanceof Error ? error.message : 'Unknown error'
        )
    }
}

export const issueController = { createIssue, getAllIssues, getSingleIssue, updateIssue, deleteIssue, getIssueMetrics }