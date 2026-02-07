import { Room } from './room.model';
import { User } from './user.model';

// Reservation/Booking status
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

// Reservation interface
export interface Reservation {
    id: number;
    customerId: number;
    customer?: User;
    roomId: number;
    room?: Room;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    totalAmount: number;
    status: ReservationStatus;
    specialRequests?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Create reservation data
export interface CreateReservationData {
    roomId: number;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    specialRequests?: string;
}
