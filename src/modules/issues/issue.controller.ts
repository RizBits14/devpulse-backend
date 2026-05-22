import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import type { IssueQuery } from "./issue.interface";

const createIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, type } = req.body || {}

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized access',
                errors: 'User information is missing from token'
            })
            return
        }

        if (!title || !description || !type) {
            res.status(400).json({
                success: false,
                message: 'Title, description and type are required'
            })
            return
        }

        if (title.length > 150) {
            res.status(400).json({
                success: false,
                message: 'Title must not exceed 150 characters'
            })
            return
        }

        if (description.length < 20) {
            res.status(400).json({
                success: false,
                message: 'Description must be at least 20 characters long'
            })
            return
        }

        if (type !== 'bug' && type !== 'feature_request') {
            res.status(400).json({
                success: false,
                message: 'Type must be bug or feature_request'
            })
            return
        }

        const issue = await issueService.createIssueIntoDB(
            {
                title,
                description,
                type
            },
            req.user.id
        )

        res.status(201).json({
            success: true,
            message: 'Issue created successfully',
            data: issue
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Issue creation failed',
            errors: error instanceof Error ? error.message : 'Unknown error'
        })
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
            res.status(400).json({
                success: false,
                message: 'Sort must be newest or oldest'
            })
            return
        }

        if (typeValue && typeValue !== 'bug' && typeValue !== 'feature_request') {
            res.status(400).json({
                success: false,
                message: 'Type must be bug or feature_request'
            })
            return
        }

        if (
            statusValue &&
            statusValue !== 'open' &&
            statusValue !== 'in_progress' &&
            statusValue !== 'resolved'
        ) {
            res.status(400).json({
                success: false,
                message: 'Status must be open, in_progress or resolved'
            })
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

        res.status(200).json({
            success: true,
            data: issues,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve issues',
            errors: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

const getSingleIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const issueId = Number(req.params.id)

        if (!Number.isInteger(issueId) || issueId <= 0) {
            res.status(400).json({
                success: false,
                message: 'Issue id must be a valid positive number'
            })
            return
        }

        const issue = await issueService.getSingleIssueFromDB(issueId)

        if (!issue) {
            res.status(404).json({
                success: false,
                message: 'Issue not found'
            })
            return
        }

        res.status(200).json({
            success: true,
            data: issue
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve issue',
            errors: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

const updateIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const issueId = Number(req.params.id)

        if (!Number.isInteger(issueId) || issueId <= 0) {
            res.status(400).json({
                success: false,
                message: 'Issue id must be a valid positive number',
            })
            return
        }

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized access',
                errors: 'User information is missing from token',
            })
            return
        }

        const existingIssue = await issueService.getRawIssueByIdFromDB(issueId)

        if (!existingIssue) {
            res.status(404).json({
                success: false,
                message: 'Issue not found',
            })
            return
        }

        const isMaintainer = req.user.role === 'maintainer'
        const isOwnIssue = existingIssue.reporter_id === req.user.id

        if (!isMaintainer && !isOwnIssue) {
            res.status(403).json({
                success: false,
                message: 'Forbidden access',
                errors: 'You can only update your own issue'
            })
            return
        }

        if (!isMaintainer && existingIssue.status !== 'open') {
            res.status(409).json({
                success: false,
                message: 'Only open issues can be updated by contributor',
            })
            return
        }

        const { title, description, type, status } = req.body || {}

        if (
            title === undefined &&
            description === undefined &&
            type === undefined &&
            status === undefined
        ) {
            res.status(400).json({
                success: false,
                message: 'At least one field is required for update'
            })
            return
        }

        if (title !== undefined && title.length > 150) {
            res.status(400).json({
                success: false,
                message: 'Title must not exceed 150 characters'
            })
            return
        }

        if (description !== undefined && description.length < 20) {
            res.status(400).json({
                success: false,
                message: 'Description must be at least 20 characters long',
            })
            return
        }

        if (type !== undefined && type !== 'bug' && type !== 'feature_request') {
            res.status(400).json({
                success: false,
                message: 'Type must be bug or feature_request',
            })
            return
        }

        if (
            status !== undefined &&
            status !== 'open' &&
            status !== 'in_progress' &&
            status !== 'resolved'
        ) {
            res.status(400).json({
                success: false,
                message: 'Status must be open, in_progress or resolved'
            })
            return
        }

        if (!isMaintainer && status !== undefined) {
            res.status(403).json({
                success: false,
                message: 'Forbidden access',
                errors: 'Only maintainer can update issue status'
            })
            return
        }

        const updatedIssue = await issueService.updateIssueIntoDB(issueId, {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(type !== undefined && { type }),
            ...(status !== undefined && { status })
        })

        res.status(200).json({
            success: true,
            message: 'Issue updated successfully',
            data: updatedIssue
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Issue update failed',
            errors: error instanceof Error ? error.message : 'Unknown error',
        })
    }
}

const deleteIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const issueId = Number(req.params.id)

        if (!Number.isInteger(issueId) || issueId <= 0) {
            res.status(400).json({
                success: false,
                message: 'Issue id must be a valid positive number'
            })
            return
        }

        const isDeleted = await issueService.deleteIssueFromDB(issueId);

        if (!isDeleted) {
            res.status(404).json({
                success: false,
                message: 'Issue not found'
            })
            return
        }

        res.status(200).json({
            success: true,
            message: 'Issue deleted successfully'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Issue deletion failed',
            errors: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

const getIssueMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
        const metrics = await issueService.getIssueMetricsFromDB()

        res.status(200).json({
            success: true,
            message: 'Issue metrics retrieved successfully',
            data: metrics,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve issue metrics',
            errors: error instanceof Error ? error.message : 'Unknown error',
        })
    }
}

export const issueController = { createIssue, getAllIssues, getSingleIssue, updateIssue, deleteIssue, getIssueMetrics }