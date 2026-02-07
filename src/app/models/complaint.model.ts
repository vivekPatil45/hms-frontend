import { User } from './user.model';

// Complaint status
export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Complaint interface
export interface Complaint {
    id: number;
    customerId: number;
    customer?: User;
    title: string;
    description: string;
    category: string;
    priority: ComplaintPriority;
    status: ComplaintStatus;
    assignedToId?: number;
    assignedTo?: User;
    resolution?: string;
    createdAt?: string;
    updatedAt?: string;
    resolvedAt?: string;
}

// Create complaint data
export interface CreateComplaintData {
    title: string;
    description: string;
    category: string;
    priority: ComplaintPriority;
}

// Update complaint data
export interface UpdateComplaintData {
    status?: ComplaintStatus;
    assignedToId?: number;
    resolution?: string;
}
