import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../shared/utils/constants';
import { ApiResponse } from '../../models/user.model';
import { Room } from '../../models/room.model';

import { Reservation } from '../../models/reservation.model';

export interface CreateReservationRequest {
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfAdults: number;
    numberOfChildren: number;
    specialRequests?: string;
}

export interface PaymentRequest {
    paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'WALLET'; // Adjust generic types as needed
    transactionId: string;
}

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private apiUrl = `${API_BASE_URL}/customer/reservations`;

    constructor(private http: HttpClient) { }

    createReservation(request: CreateReservationRequest): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(this.apiUrl, request);
    }

    getReservationById(reservationId: string): Observable<ApiResponse<Reservation>> {
        return this.http.get<ApiResponse<Reservation>>(`${this.apiUrl}/${reservationId}`);
    }

    confirmPayment(reservationId: string, payment: PaymentRequest): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${reservationId}/payment`, payment);
    }

    getMyBookings(): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.apiUrl}?page=0&size=10`);
    }

    cancelReservation(reservationId: string): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${reservationId}`, {
            body: { cancellationReason: 'User requested cancellation' }
        });
    }
}
