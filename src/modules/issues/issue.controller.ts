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

export const issueController = { createIssue, getAllIssues }