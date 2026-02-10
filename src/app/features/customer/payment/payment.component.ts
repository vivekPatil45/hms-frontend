import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { Reservation } from '../../../models/reservation.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ButtonComponent, LoadingSpinnerComponent],
  template: `
    <div class="max-w-xl mx-auto p-6">
      <h1 class="text-3xl font-bold text-foreground mb-6">Payment</h1>

      @if (isLoading) {
        <div class="flex justify-center py-12">
          <app-loading-spinner size="lg"></app-loading-spinner>
        </div>
      } @else if (reservation) {
        <div class="bg-card rounded-xl border border-border p-6 shadow-sm mb-6">
          <div class="flex justify-between items-center mb-4 border-b border-border pb-4">
            <div>
              <p class="text-sm text-muted-foreground">Total Amount to Pay</p>
              <h2 class="text-3xl font-bold text-primary">\${{ reservation.totalAmount }}</h2>
            </div>
            <div class="text-right">
              <p class="text-sm text-foreground font-medium">Reservation ID</p>
              <p class="text-xs text-muted-foreground">{{ reservation.reservationId }}</p>
            </div>
          </div>

          <form [formGroup]="paymentForm" (ngSubmit)="handlePayment()" class="space-y-4">
            <!-- Cardholder Name -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Cardholder Name</label>
              <input 
                type="text" 
                formControlName="cardHolderName"
                class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                placeholder="Name on card"
                [class.border-destructive]="isFieldInvalid('cardHolderName')"
              >
              @if (isFieldInvalid('cardHolderName')) {
                <span class="text-xs text-destructive">Name is required (min 3 chars)</span>
              }
            </div>

            <!-- Card Number -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Card Number</label>
              <input 
                type="text" 
                formControlName="cardNumber"
                class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                placeholder="16-digit card number"
                maxlength="16"
                [class.border-destructive]="isFieldInvalid('cardNumber')"
              >
              @if (isFieldInvalid('cardNumber')) {
                <span class="text-xs text-destructive">Valid 16-digit card number is required</span>
              }
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Expiry Date -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Expiry Date (MM/YY)</label>
                <input 
                  type="text" 
                  formControlName="expiryDate"
                  class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  placeholder="MM/YY"
                  [class.border-destructive]="isFieldInvalid('expiryDate')"
                >
                 @if (isFieldInvalid('expiryDate')) {
                  <span class="text-xs text-destructive">Future date required</span>
                }
              </div>

              <!-- CVV -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">CVV</label>
                <input 
                  type="password" 
                  formControlName="cvv"
                  class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  placeholder="3 or 4 digits"
                  maxlength="4"
                  [class.border-destructive]="isFieldInvalid('cvv')"
                >
                 @if (isFieldInvalid('cvv')) {
                  <span class="text-xs text-destructive">Invalid CVV</span>
                }
              </div>
            </div>

            <!-- Billing Address -->
             <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Billing Address</label>
              <textarea 
                formControlName="billingAddress"
                class="w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                placeholder="Enter your billing address"
                [class.border-destructive]="isFieldInvalid('billingAddress')"
              ></textarea>
               @if (isFieldInvalid('billingAddress')) {
                <span class="text-xs text-destructive">Address is required (min 5 chars)</span>
              }
            </div>


            <app-button 
                class="w-full mt-6" 
                type="submit"
                [disabled]="paymentForm.invalid || isProcessing"
            >
                @if (isProcessing) {
                    Processing Payment...
                } @else {
                    Pay Now
                }
            </app-button>
          </form>
        </div>
      } @else {
         <div class="text-center py-12 text-destructive">
          <p>{{ errorMessage || 'Error loading reservation details.' }}</p>
          <app-button variant="outline" class="mt-4" routerLink="/customer/rooms">Return to Rooms</app-button>
        </div>
      }
    </div>
  `
})
export class PaymentComponent implements OnInit {
  reservationId: string = '';
  reservation: Reservation | null = null;
  isLoading = true;
  isProcessing = false;
  paymentForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private fb: FormBuilder
  ) {
    console.log('PaymentComponent: Constructor called');
    this.paymentForm = this.fb.group({
      cardHolderName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z\s]*$/)]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
      billingAddress: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit() {
    console.log('PaymentComponent: ngOnInit called');
    this.reservationId = this.route.snapshot.paramMap.get('reservationId') || '';
    console.log('PaymentComponent: Reservation ID extracted:', this.reservationId);

    if (this.reservationId) {
      this.fetchReservation();
    } else {
      console.error('PaymentComponent: No Reservation ID found in route');
      this.errorMessage = 'Invalid Reservation ID';
      this.isLoading = false;
    }
  }

  fetchReservation() {
    console.log('PaymentComponent: Fetching reservation details...');
    this.isLoading = true;
    this.errorMessage = '';
    this.bookingService.getReservationById(this.reservationId).subscribe({
      next: (response) => {
        console.log('PaymentComponent: Reservation fetched successfully', response);
        this.reservation = response.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('PaymentComponent: Error fetching reservation', err);
        this.errorMessage = err.error?.message || 'Failed to load reservation details.';
        this.isLoading = false;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.paymentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  handlePayment() {
    if (this.paymentForm.invalid) return;

    this.isProcessing = true;

    // Simulate Gateway Delay
    setTimeout(() => {
      const mockTransactionId = 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();

      this.bookingService.confirmPayment(this.reservationId, {
        paymentMethod: 'CREDIT_CARD',
        transactionId: mockTransactionId
      }).subscribe({
        next: () => {
          this.router.navigate(['/customer/booking-success', this.reservationId]);
        },
        error: (err) => {
          console.error('Payment confirmation failed', err);
          alert('Transaction failed. Please check your details and try again.');
          this.isProcessing = false;
        }
      });
    }, 2000);
  }
}
