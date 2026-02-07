import { Reservation } from './reservation.model';
import { User } from './user.model';

// Bill status
export type BillStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'NET_BANKING';

// Bill interface
export interface Bill {
    id: number;
    reservationId: number;
    reservation?: Reservation;
    customerId: number;
    customer?: User;
    amount: number;
    tax: number;
    discount: number;
    totalAmount: number;
    status: BillStatus;
    paymentMethod?: PaymentMethod;
    paymentDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Create bill data
export interface CreateBillData {
    reservationId: number;
    amount: number;
    tax: number;
    discount: number;
}

// Payment data
export interface PaymentData {
    billId: number;
    paymentMethod: PaymentMethod;
}
