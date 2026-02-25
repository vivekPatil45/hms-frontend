import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Reservation } from '../../../models/reservation.model';
import { BookingService } from '../../../core/services/booking.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CancelBookingModalComponent } from './cancel-booking-modal.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-customer-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    CancelBookingModalComponent
  ],
  template: `
    <div class="space-y-6 animate-fade-in relative">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Booking History</h1>
        <p class="text-muted-foreground mt-1">
          View your past and upcoming reservations
        </p>
      </div>

      <!-- Tabs -->
      <div class="flex space-x-4 border-b border-border">
        <button 
          class="pb-2 px-1 font-medium transition-colors border-b-2"
          [class.border-primary]="activeTab === 'upcoming'"
          [class.text-primary]="activeTab === 'upcoming'"
          [class.border-transparent]="activeTab !== 'upcoming'"
          [class.text-muted-foreground]="activeTab !== 'upcoming'"
          [class.hover:text-foreground]="activeTab !== 'upcoming'"
          (click)="activeTab = 'upcoming'"
        >
          Upcoming Bookings
        </button>
        <button 
          class="pb-2 px-1 font-medium transition-colors border-b-2"
          [class.border-primary]="activeTab === 'past'"
          [class.text-primary]="activeTab === 'past'"
          [class.border-transparent]="activeTab !== 'past'"
          [class.text-muted-foreground]="activeTab !== 'past'"
          [class.hover:text-foreground]="activeTab !== 'past'"
          (click)="activeTab = 'past'"
        >
          Past Bookings
        </button>
      </div>

      @if (isLoading) {
         <div class="flex justify-center py-12">
            <app-loading-spinner size="lg"></app-loading-spinner>
         </div>
      } @else if (filteredBookings.length > 0) {
        <div class="bg-card rounded-xl border border-border overflow-hidden">
            <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                <tr class="bg-muted/50 border-b border-border">
                 <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm whitespace-nowrap">Booking ID</th>
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm whitespace-nowrap">Hotel &amp; Room</th>
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm whitespace-nowrap">Dates</th>
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm whitespace-nowrap">Status</th>
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm whitespace-nowrap">Amount</th>
                    <th class="text-center py-3 px-4 font-medium text-muted-foreground text-sm whitespace-nowrap">Actions</th>
                </tr>
                </thead>
                <tbody class="divide-y divide-border">
                @for (booking of filteredBookings; track booking.reservationId) {
                    <tr class="hover:bg-muted/50 transition-colors">
                    <td class="py-3 px-4">
                        <button class="font-medium text-primary hover:underline text-left outline-none" (click)="openDetails(booking)">
                           {{ booking.reservationId }}
                        </button>
                        @if (booking.status === 'CANCELLED') {
                             <div class="text-[10px] text-destructive mt-1">
                                Cancelled on {{ (booking.cancellationDate || booking.updatedAt) | date:'mediumDate' }}
                             </div>
                        }
                    </td>
                    <td class="py-3 px-4">
                        <div class="font-medium text-foreground whitespace-nowrap">Grand Hotel, Pune</div>
                        <div class="text-xs text-muted-foreground whitespace-nowrap">{{ booking.room?.roomType }} (Room {{ booking.room?.roomNumber }})</div>
                    </td>
                    <td class="py-3 px-4 text-sm text-foreground">
                        <div>In: {{ booking.checkInDate | date:'dd-MM-yyyy' }}</div>
                        <div class="text-muted-foreground">Out: {{ booking.checkOutDate | date:'dd-MM-yyyy' }}</div>
                    </td>
                    <td class="py-3 px-4">
                        <app-status-badge [status]="booking.status"></app-status-badge>
                        @if (booking.paymentStatus === 'PENDING') {
                            <div class="text-[10px] text-amber-500 mt-1">Payment Pending</div>
                        }
                    </td>
                    <td class="py-3 px-4 text-sm font-medium text-foreground">
                        ₹{{ booking.totalAmount }}
                    </td>
                    <td class="py-3 px-4">
                        <!-- Upcoming Actions -->
                        @if (activeTab === 'upcoming' && booking.status !== 'CANCELLED') {
                            <div class="flex flex-col gap-1.5 min-w-[120px]">
                                <button class="w-full text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors" (click)="openDetails(booking)">
                                    View Details
                                </button>
                                <div class="flex gap-1.5">
                                    <button class="flex-1 text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted text-foreground transition-colors" [routerLink]="['/customer/modify-booking', booking.reservationId]">
                                        Modify
                                    </button>
                                    <button class="flex-1 text-xs font-medium px-3 py-1.5 rounded-md bg-destructive hover:bg-destructive/90 text-white transition-colors" (click)="openCancelModal(booking)">
                                        Cancel
                                    </button>
                                </div>
                                <button class="w-full text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted text-foreground transition-colors flex items-center justify-center gap-1" (click)="downloadInvoiceOrWarn(booking)">
                                    <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                    Invoice
                                </button>
                            </div>
                        } @else {
                            <!-- Past/Cancelled Actions -->
                            <div class="flex flex-col gap-1.5 min-w-[120px]">
                                <button class="w-full text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors" (click)="openDetails(booking)">
                                    View Details
                                </button>
                                @if (booking.status !== 'CANCELLED') {
                                    <button class="w-full text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted text-foreground transition-colors flex items-center justify-center gap-1" (click)="downloadInvoiceOrWarn(booking)">
                                        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                        Invoice
                                    </button>
                                }
                            </div>
                        }
                    </td>
                    </tr>
                }
                </tbody>
            </table>
            </div>
        </div>
      } @else {
         <div class="text-center py-12 bg-card rounded-xl border border-border shadow-sm">
            <h3 class="text-lg font-medium text-foreground mb-2">No bookings found</h3>
            <p class="text-muted-foreground mb-6">You don't have any {{ activeTab }} bookings yet.</p>
            <app-button [routerLink]="['/customer/home']">Explore Rooms</app-button>
         </div>
      }
    </div>

      <!-- Booking Details Modal -->
      @if (selectedBooking) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div class="bg-card w-full max-w-2xl rounded-xl shadow-lg border border-border p-6 relative max-h-[90vh] overflow-y-auto">
            <button class="absolute top-4 right-4 text-muted-foreground hover:text-foreground" (click)="closeDetails()">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <h2 class="text-2xl font-bold mb-6">Booking Details</h2>
            
            <div class="grid grid-cols-2 gap-6 mb-6">
                <div>
                    <p class="text-sm text-muted-foreground">Booking ID</p>
                    <p class="font-medium">{{ selectedBooking.reservationId }}</p>
                </div>
                <div>
                    <p class="text-sm text-muted-foreground">Status</p>
                    <app-status-badge [status]="selectedBooking.status"></app-status-badge>
                </div>
                <div>
                    <p class="text-sm text-muted-foreground">Hotel</p>
                    <p class="font-medium">Grand Hotel</p>
                    <p class="text-sm text-muted-foreground">12, Koregaon Park Road, Pune</p>
                </div>
                <div>
                    <p class="text-sm text-muted-foreground">Room</p>
                    <p class="font-medium">{{ selectedBooking.room?.roomType }}</p>
                    <p class="text-sm text-muted-foreground">Room: {{ selectedBooking.room?.roomNumber }}</p>
                </div>
                <div>
                    <p class="text-sm text-muted-foreground">Check-in</p>
                    <p class="font-medium">{{ selectedBooking.checkInDate | date:'dd-MM-yyyy' }}</p>
                </div>
                <div>
                    <p class="text-sm text-muted-foreground">Check-out</p>
                    <p class="font-medium">{{ selectedBooking.checkOutDate | date:'dd-MM-yyyy' }}</p>
                </div>
                <div>
                    <p class="text-sm text-muted-foreground">Guests</p>
                    <p class="font-medium">{{ selectedBooking.numberOfAdults }} Adults, {{ selectedBooking.numberOfChildren }} Children</p>
                </div>
                <div>
                    <p class="text-sm text-muted-foreground">Total Amount</p>
                    <p class="font-bold text-lg text-primary">₹{{ selectedBooking.totalAmount }}</p>
                    <p class="text-xs" [class.text-green-600]="selectedBooking.paymentStatus === 'PAID'" [class.text-amber-500]="selectedBooking.paymentStatus !== 'PAID'">
                        Payment: {{ selectedBooking.paymentStatus }}
                    </p>
                </div>
            </div>

            @if (selectedBooking.status === 'CANCELLED') {
                <div class="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
                    <p class="font-medium">This booking was cancelled.</p>
                    @if(selectedBooking.cancellationReason) {
                        <p class="text-sm mt-1">Reason: {{ selectedBooking.cancellationReason }}</p>
                    }
                </div>
            }

            <div class="flex justify-end space-x-3 border-t border-border pt-4">
               @if (selectedBooking.status === 'PENDING_PAYMENT' || selectedBooking.status === 'CONFIRMED') {
                    <app-button variant="destructive" (click)="openCancelModal(selectedBooking); closeDetails()">Cancel Booking</app-button>
               }
               <app-button variant="outline" (click)="downloadInvoiceOrWarn(selectedBooking)">Download Invoice</app-button>
               <app-button (click)="closeDetails()">Close</app-button>
            </div>
          </div>
        </div>
    }

    <!-- Cancel Booking Modal -->
    @if (bookingToCancel) {
        <app-cancel-booking-modal
            [isOpen]="true"
            [reservation]="bookingToCancel"
            (modalClosed)="onCancelModalClosed($event)"
        ></app-cancel-booking-modal>
    }
  `,
  styles: []
})
export class CustomerHistoryComponent implements OnInit {
  bookings: Reservation[] = [];
  isLoading = true;
  activeTab: 'upcoming' | 'past' = 'upcoming';
  selectedBooking: Reservation | null = null;
  error = '';
  bookingToCancel: Reservation | null = null;

  constructor(
    private bookingService: BookingService,
    private invoiceService: InvoiceService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.fetchBookings();
  }

  fetchBookings() {
    this.isLoading = true;
    this.error = '';
    this.bookingService.getMyBookings().subscribe({
      next: (res) => {
        this.bookings = res.data.content || [];
        // Sort by dates descending by default
        this.bookings.sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime());
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load bookings. Please try again later.';
        this.isLoading = false;
        console.error('Error fetching bookings', err);
      }
    });
  }

  get filteredBookings(): Reservation[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    return this.bookings.filter(booking => {
      // Safe parsing of Date
      const checkOutDateParts = booking.checkOutDate.split('-'); // Assuming YYYY-MM-DD from backend
      const checkOut = new Date(parseInt(checkOutDateParts[0]), parseInt(checkOutDateParts[1]) - 1, parseInt(checkOutDateParts[2]));

      if (this.activeTab === 'upcoming') {
        // Upcoming includes ongoing and future stays that are NOT completed/cancelled
        return checkOut >= today && booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED';
      } else {
        // Past includes checkOut < today OR explicitly COMPLETED/CANCELLED
        return checkOut < today || booking.status === 'COMPLETED' || booking.status === 'CANCELLED';
      }
    });
  }

  openDetails(booking: Reservation) {
    this.selectedBooking = booking;
  }

  closeDetails() {
    this.selectedBooking = null;
  }

  openCancelModal(booking: Reservation) {
    this.bookingToCancel = booking;
  }

  onCancelModalClosed(success: boolean) {
    this.bookingToCancel = null;
    if (success) {
      this.fetchBookings(); // Refresh list to show updated status
    }
  }

  downloadInvoiceOrWarn(booking: Reservation) {
    if (booking.paymentStatus !== 'PAID') {
      this.toastService.error('Invoice will be available after full payment.');
      return;
    }

    try {
      this.invoiceService.generateInvoice(booking);
    } catch (error) {
      console.error('Invoice generation failed', error);
      this.toastService.error('Unable to generate invoice. Please try again later.');
    }
  }

}
