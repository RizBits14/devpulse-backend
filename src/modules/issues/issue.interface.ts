export type IssueType = 'bug' | 'feature_request';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';

export interface CreateIssuePayload {
    title: string
    description: string
    type: IssueType
}

export interface Issue {
    id: number
    title: string
    description: string
    type: IssueType
    status: IssueStatus
    reporter_id: number
    created_at: Date
    updated_at: Date
}

export interface Reporter {
    id: number
    name: string
    role: 'contributor' | 'maintainer'
}

export interface IssueWithReporter {
    id: number
    title: string
    description: string
    type: IssueType
    status: IssueStatus
    reporter: Reporter
    created_at: Date
    updated_at: Date
}

export type IssueSort = 'newest' | 'oldest';

export interface IssueQuery {
    sort?: IssueSort
    type?: IssueType
    status?: IssueStatus
}

export interface UpdateIssuePayload {
    title?: string
    description?: string
    type?: IssueType
    status?: IssueStatus
}