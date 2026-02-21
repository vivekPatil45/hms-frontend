import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation } from '../../models/reservation.model';
import { ApiResponse } from '../../models/user.model';
import { API_BASE_URL } from '../../shared/utils/constants';

// We need custom interfaces for the data we send
export interface AdminCreateReservationData {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfAdults: number;
    numberOfChildren?: number;
    specialRequests?: string;
    paymentMethod?: string;
}

export interface ModifyReservationData {
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfAdults: number;
    numberOfChildren?: number;
    specialRequests?: string;
}

// Ensure PaginatedReservationResponse matches PaginatedRoomResponse pattern
export interface PaginatedReservationResponse {
    content: Reservation[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class AdminReservationService {
    private apiUrl = `${API_BASE_URL}/admin/reservations`;

    constructor(private http: HttpClient) { }

    /**
     * Get all reservations with pagination, filtering, and sorting
     */
    getReservations(
        page: number = 0,
        size: number = 10,
        filters?: {
            status?: string,
            dateFrom?: string,
            dateTo?: string,
            roomType?: string,
            searchQuery?: string,
            bookingDate?: string
        }
    ): Observable<ApiResponse<PaginatedReservationResponse>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (filters?.status) params = params.set('status', filters.status);
        if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
        if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
        if (filters?.roomType) params = params.set('roomType', filters.roomType);
        if (filters?.searchQuery) params = params.set('q', filters.searchQuery);
        if (filters?.bookingDate) params = params.set('bookingDate', filters.bookingDate);

        return this.http.get<ApiResponse<PaginatedReservationResponse>>(this.apiUrl, { params });
    }

    /**
     * Create a new reservation explicitly by an admin
     */
    createReservation(data: AdminCreateReservationData): Observable<ApiResponse<Reservation>> {
        return this.http.post<ApiResponse<Reservation>>(this.apiUrl, data);
    }

    /**
     * Update an existing reservation
     */
    updateReservation(reservationId: string, data: ModifyReservationData): Observable<ApiResponse<Reservation>> {
        return this.http.put<ApiResponse<Reservation>>(`${this.apiUrl}/${reservationId}`, data);
    }

    /**
     * Cancel an existing reservation
     */
    cancelReservation(reservationId: string): Observable<ApiResponse<string>> {
        return this.http.put<ApiResponse<string>>(`${this.apiUrl}/${reservationId}/cancel`, {});
    }
}
