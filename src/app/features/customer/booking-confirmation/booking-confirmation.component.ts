import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../../core/services/room.service';
import { BookingService, CreateReservationRequest } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { Room } from '../../../models/room.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      <h1 class="text-3xl font-bold text-foreground">Confirm Your Booking</h1>

      @if (isLoading) {
        <div class="flex justify-center py-12">
          <app-loading-spinner size="lg"></app-loading-spinner>
        </div>
      } @else if (room) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Left Column: Room & Booking Details -->
          <div class="md:col-span-2 space-y-6">
            <!-- Room Info -->
            <div class="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 class="text-xl font-semibold mb-4 text-foreground">Room Details</h2>
              <div class="flex flex-col md:flex-row gap-4">
                @if (room.images && room.images.length > 0) {
                  <img [src]="room.images[0]" alt="Room" class="w-full md:w-48 h-32 object-cover rounded-md">
                } @else {
                  <img [src]="getRandomRoomImage(room.roomNumber)" alt="Room" class="w-full md:w-48 h-32 object-cover rounded-md">
                }
                <div>
                  <h3 class="font-medium text-lg text-primary">{{ room.roomType }} Room</h3>
                  <p class="text-sm text-muted-foreground">Room {{ room.roomNumber }} • Floor {{ room.floor }}</p>
                  <p class="text-sm text-foreground mt-2">{{ room.description }}</p>
                  <div class="flex flex-wrap gap-2 mt-3">
                    @for (amenity of room.amenities; track amenity) {
                      <span class="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">{{ amenity }}</span>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Customer Details -->
            <div class="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 class="text-xl font-semibold mb-4 text-foreground">Guest Details</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div class="space-y-1">
                  <p class="text-muted-foreground">Name</p>
                  <p class="font-medium text-foreground text-base">{{ user?.fullName || 'N/A' }}</p>
                </div>
                <div class="space-y-1 overflow-hidden">
                  <p class="text-muted-foreground">Email</p>
                  <p class="font-medium text-foreground text-base truncate" [title]="user?.email || ''">{{ user?.email || 'N/A' }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-muted-foreground">Phone</p>
                  <p class="font-medium text-foreground text-base">{{ user?.mobileNumber || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Special Requests -->
            <div class="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 class="text-xl font-semibold mb-4 text-foreground">Special Requests</h2>
              <textarea 
                [(ngModel)]="specialRequests" 
                class="w-full h-24 p-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary"
                placeholder="Any special requests? (e.g. Late check-in, Extra bed...)"
              ></textarea>
            </div>
          </div>

          <!-- Right Column: Price Summary -->
          <div class="md:col-span-1">
            <div class="bg-card rounded-xl border border-border p-6 shadow-sm sticky top-24">
              <h2 class="text-xl font-semibold mb-4 text-foreground">Price Summary</h2>
              
              <div class="space-y-3 text-sm border-b border-border pb-4 mb-4">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Check-in</span>
                  <span class="font-medium text-foreground">{{ checkInDate }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Check-out</span>
                  <span class="font-medium text-foreground">{{ checkOutDate }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Guests</span>
                  <span class="font-medium text-foreground">{{ numberOfAdults }} Adults, {{ numberOfChildren }} Children</span>
                </div>
                 <div class="flex justify-between">
                  <span class="text-muted-foreground">Nights</span>
                  <span class="font-medium text-foreground">{{ numberOfNights }}</span>
                </div>
              </div>

              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Base Price (x{{numberOfNights}})</span>
                  <span class="text-foreground">₹{{ basePrice }}</span>
                </div>
                 <div class="flex justify-between">
                  <span class="text-muted-foreground">Taxes (12%)</span>
                  <span class="text-foreground">₹{{ taxAmount }}</span>
                </div>
                <div class="flex justify-between pt-4 border-t border-border">
                  <span class="text-lg font-bold text-foreground">Total</span>
                  <span class="text-lg font-bold text-primary">₹{{ totalAmount }}</span>
                </div>
              </div>

              <app-button 
                [className]="'w-full mt-6'" 
                (click)="proceedToPayment()"
                [disabled]="isProcessing"
              >
                @if (isProcessing) {
                  Processing...
                } @else {
                  Proceed to Payment
                }
              </app-button>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-12 text-destructive">
          <p>Error loading room details. Please try again.</p>
          <app-button (click)="goBack()" variant="outline" class="mt-4">Go Back</app-button>
        </div>
      }
    </div>
  `
})
export class BookingConfirmationComponent implements OnInit {
  room: Room | null = null;
  user: any = null;
  isLoading = true;
  isProcessing = false;

  // Booking Params
  roomId: string = '';
  checkInDate: string = '';
  checkOutDate: string = '';
  numberOfAdults: number = 1;
  numberOfChildren: number = 0;
  specialRequests: string = '';

  // Calculations
  numberOfNights: number = 0;
  basePrice: number = 0;
  taxAmount: number = 0;
  totalAmount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
    private bookingService: BookingService,
    private authService: AuthService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    console.log('Booking Confirmation - User:', this.user);


    this.route.params.subscribe(params => {
      this.roomId = params['roomId'];
      if (this.roomId) {
        this.fetchRoomDetails(this.roomId);
      }
    });

    this.route.queryParams.subscribe(params => {
      this.checkInDate = params['checkIn'];
      this.checkOutDate = params['checkOut'];
      this.numberOfAdults = +params['adults'] || 1;
      this.numberOfChildren = +params['children'] || 0;
    });
  }

  fetchRoomDetails(id: string) {
    this.isLoading = true;
    this.roomService.getRoomById(id).subscribe({
      next: (response) => {
        this.room = response.data;
        this.calculatePrice();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching room', err);
        this.isLoading = false;
      }
    });
  }

  calculatePrice() {
    if (!this.room || !this.checkInDate || !this.checkOutDate) return;

    const start = new Date(this.checkInDate);
    const end = new Date(this.checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    this.numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (this.numberOfNights < 1) this.numberOfNights = 1; // Fallback

    this.basePrice = this.room.pricePerNight * this.numberOfNights;
    this.taxAmount = +(this.basePrice * 0.12).toFixed(2);
    this.totalAmount = +(this.basePrice + this.taxAmount).toFixed(2);
  }

  proceedToPayment() {
    if (!this.roomId) return;

    this.isProcessing = true;
    const request: CreateReservationRequest = {
      roomId: this.roomId,
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate,
      numberOfAdults: this.numberOfAdults,
      numberOfChildren: this.numberOfChildren,
      specialRequests: this.specialRequests
    };

    this.bookingService.createReservation(request).subscribe({
      next: (response) => {
        const reservationId = response.data.reservationId;
        this.router.navigate(['/customer/payment', reservationId]);
      },
      error: (err) => {
        console.error('Booking failed', err);
        this.toastService.error(err.error?.message || 'Failed to initiate booking. Please try again.');
        this.isProcessing = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/customer/rooms']);
  }

  getRandomRoomImage(roomNumber: string): string {
    const images = ['room1.png', 'room2.png', 'room3.png', 'room4.png', 'room5.png'];
    let hash = 0;
    for (let i = 0; i < roomNumber.length; i++) {
      hash = roomNumber.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % images.length;
    return `assets/${images[index]}`;
  }
}
