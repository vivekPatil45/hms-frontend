import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../shared/utils/constants';
import { User, ApiResponse } from '../../models/user.model';

import { Complaint, CreateComplaintData } from '../../models/complaint.model';

export interface ComplaintRequest {
    reservationId?: string | null;
    category: string;
    title: string;
    description: string;
    contactPreference: string;
}

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    private apiUrl = `${API_BASE_URL}/customer`;
    private complaintsUrl = `${API_BASE_URL}/customer/complaints`;

    constructor(private http: HttpClient) { }

    // Profile Management
    getProfile(userId: string): Observable<ApiResponse<User>> {
        return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${userId}`);
    }

    updateProfile(userId: string, data: Partial<User>): Observable<ApiResponse<User>> {
        return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${userId}`, data);
    }

    // Complaint Management
    getMyComplaints(): Observable<ApiResponse<Complaint[]>> {
        return this.http.get<ApiResponse<Complaint[]>>(`${this.complaintsUrl}`);
    }

    createComplaint(complaint: ComplaintRequest): Observable<ApiResponse<Complaint>> {
        return this.http.post<ApiResponse<Complaint>>(this.complaintsUrl, complaint);
    }

    getComplaint(id: number): Observable<ApiResponse<Complaint>> {
        return this.http.get<ApiResponse<Complaint>>(`${this.complaintsUrl}/${id}`);
    }

    getComplaintById(complaintId: string): Observable<ApiResponse<Complaint>> {
        return this.http.get<ApiResponse<Complaint>>(`${this.complaintsUrl}/${complaintId}`);
    }

    updateComplaintStatus(complaintId: string, status: string): Observable<ApiResponse<Complaint>> {
        return this.http.put<ApiResponse<Complaint>>(`${this.complaintsUrl}/${complaintId}/status`, { status });
    }
}
