// User roles
export enum UserRole {
    CUSTOMER = 'CUSTOMER',
    ADMIN = 'ADMIN',
    STAFF = 'STAFF'
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED'
}

// User interface
export interface User {
    userId: string;
    username: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    role: UserRole;
    status?: UserStatus;
    requirePasswordChange?: boolean;
    createdAt?: string;
    updatedAt?: string;
    address?: string;
}

// Login credentials
export interface LoginCredentials {
    username: string;
    password: string;
}

// Register data - matches backend RegisterRequest
export interface RegisterData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    mobileNumber: string;
    address: string;
}

// API Response wrapper
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors?: Array<{
        field: string;
        message: string;
    }>;
    timestamp?: string;
}

// Register response data
export interface RegisterResponseData {
    userId: string;
    username: string;
    email: string;
    fullName: string;
    message: string;
}

// Auth response for login
export interface AuthResponseData {
    token: string;
    tokenType: string;
    expiresIn: number;
    user: {
        userId: string;
        username: string;
        fullName: string;
        role: UserRole;
        requirePasswordChange: boolean;
    };
}
