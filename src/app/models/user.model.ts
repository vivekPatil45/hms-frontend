// User roles
export type UserRole = 'CUSTOMER' | 'ADMIN' | 'STAFF';

// User interface
export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    createdAt?: string;
    updatedAt?: string;
}

// Login credentials
export interface LoginCredentials {
    email: string;
    password: string;
}

// Register data
export interface RegisterData {
    name: string;
    email: string;
    phone?: string;
    password: string;
}

// Auth response
export interface AuthResponse {
    user: User;
    token: string;
}
