import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Reservation } from '../../../models/reservation.model';
import { BookingService } from '../../../core/services/booking.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-customer-history',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="space-y-6 animate-fade-in relative">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Booking History</h1>
        <p class="text-muted-foreground mt-1">
          View your past and upcoming reservations
        </p>
      </div>

      @if (isLoading) {
         <div class="flex justify-center py-12">
            <app-loading-spinner size="lg"></app-loading-spinner>
         </div>
      } @else {
        <div class="bg-card rounded-xl border border-border overflow-hidden">
            <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                <tr class="bg-muted/50 border-b border-border">
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Room</th>
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Check In</th>
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Check Out</th>
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Guests</th>
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Amount</th>
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Status</th>
                    <th class="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                </tr>
                </thead>
                <tbody class="divide-y divide-border">
                @for (booking of bookings; track booking.reservationId) {
                    <tr class="hover:bg-muted/50 transition-colors">
                    <td class="py-3 px-4">
                        <div class="font-medium text-foreground">{{ booking.room?.roomType }}</div>
                        <div class="text-xs text-muted-foreground">Room {{ booking.room?.roomNumber }}</div>
                    </td>
                    <td class="py-3 px-4 text-sm text-foreground">
                        {{ booking.checkInDate | date:'mediumDate' }}
                    </td>
                    <td class="py-3 px-4 text-sm text-foreground">
                        {{ booking.checkOutDate | date:'mediumDate' }}
                    </td>
                    <td class="py-3 px-4 text-sm text-foreground">
                        {{ booking.numberOfAdults + booking.numberOfChildren }}
                    </td>
                    <td class="py-3 px-4 text-sm font-medium text-foreground">
                        \${{ booking.totalAmount }}
                    </td>
                    <td class="py-3 px-4">
                        <app-status-badge [status]="booking.status"></app-status-badge>
                    </td>
                    <td class="py-3 px-4 text-right">
                        @if (booking.status === 'PENDING_PAYMENT' || booking.status === 'CONFIRMED') {
                        <app-button variant="destructive" size="sm" class="mr-2" (click)="cancelBooking(booking.reservationId)">
                            Cancel
                        </app-button>
                        }
                        @if (booking.paymentStatus === 'PAID') {
                            <app-button variant="outline" size="sm" class="mr-2" (click)="downloadInvoice(booking)">
                                Invoice
                            </app-button>
                        }
                    </td>
                    </tr>
                }
                </tbody>
            </table>
            </div>
            
            @if (bookings.length === 0) {
            <div class="p-8 text-center text-muted-foreground">
                No bookings found.
            </div>
            }
        </div>
      }
    </div>
  `,
  styles: []
})
export class CustomerHistoryComponent implements OnInit {
  bookings: Reservation[] = [];
  isLoading = true;

  constructor(
    private bookingService: BookingService,
    private invoiceService: InvoiceService
  ) { }

  ngOnInit() {
    this.fetchBookings();
  }

  fetchBookings() {
    this.isLoading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (response) => {
        // Backend returns response.data.content as the list
        this.bookings = response.data.content || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching bookings', err);
        this.isLoading = false;
      }
    });
  }

  cancelBooking(reservationId: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    this.bookingService.cancelReservation(reservationId).subscribe({
      next: () => {
        this.fetchBookings(); // Refresh list
      },
      error: (err) => {
        console.error('Error cancelling booking', err);
        alert('Failed to cancel booking');
      }
    });
  }

  downloadInvoice(booking: Reservation) {
    this.invoiceService.generateInvoice(booking);
  }
}
