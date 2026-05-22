export type UserRole = 'contributor' | 'maintainer'

export interface SingupPayload {
    name: string
    email: string
    password: string
    role?: UserRole
}

export interface SafeUser {
    id: number
    name: string
    email: string
    role: UserRole
    created_at: Date
    updated_at: Date
}