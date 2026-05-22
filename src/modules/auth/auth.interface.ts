export type UserRole = 'contributor' | 'maintainer'

export interface SignupPayload {
    name: string
    email: string
    password: string
    role?: UserRole
}

export interface LoginPayload {
    email: string
    password: string
}

export interface SafeUser {
    id: number
    name: string
    email: string
    role: UserRole
    created_at: Date
    updated_at: Date
}

export interface UserWithPassword extends SafeUser {
    password: string
}