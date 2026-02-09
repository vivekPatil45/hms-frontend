import { UserRole, UserStatus } from './user.model';

export interface UserResponse {
    userId: string;
    username: string;
    email: string;
    fullName: string;
    mobileNumber: string;
    address: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
}

export interface UserListResponse {
    users: UserResponse[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface CreateUserRequest {
    username: string;
    email: string;
    fullName: string;
    mobileNumber: string;
    address?: string;
    role: UserRole;
}

export interface CreateUserResponse extends UserResponse {
    generatedPassword?: string;
}

export interface UpdateUserRequest {
    email?: string;
    fullName?: string;
    mobileNumber?: string;
    address?: string;
    role?: UserRole;
    status?: UserStatus;
}
