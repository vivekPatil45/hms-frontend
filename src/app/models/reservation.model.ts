import { Room } from './room.model';
import { User } from './user.model';

// Reservation/Booking status
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

// Reservation interface
export interface Reservation {
    reservationId: string;
    customer?: any;
    roomId?: string;
    room?: any; // Room object
    checkInDate: string;
    checkOutDate: string;
    numberOfAdults: number;
    numberOfChildren: number;
    numberOfNights: number;
    baseAmount: number;
    taxAmount: number;
    discountAmount?: number;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    paymentMethod?: string;
    transactionId?: string;
    specialRequests?: string;
    createdAt?: string;
    updatedAt?: string;
    cancellationDate?: string;
    cancellationReason?: string;
}

// Create reservation data
export interface CreateReservationData {
    roomId: number;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    specialRequests?: string;
}
