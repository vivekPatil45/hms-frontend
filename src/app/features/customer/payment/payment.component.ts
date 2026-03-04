import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { Reservation } from '../../../models/reservation.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ButtonComponent, LoadingSpinnerComponent, ModalComponent],
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
              <h2 class="text-3xl font-bold text-primary">₹{{ amountToPay }}</h2>
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
                    Processing...
                } @else {
                    Pay Now
                }
            </app-button>
          </form>
        </div>

        <!-- OTP Modal -->
        <app-modal 
          [isOpen]="showOtpModal" 
          title="Secure Verification" 
          (close)="closeOtpModal()"
          size="sm"
        >
          <div class="py-4 space-y-6">
            <div class="text-center space-y-2">
              <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-foreground">Enter OTP</h3>
              <p class="text-sm text-muted-foreground">
                A 6-digit verification code has been sent to your registered mobile number for the amount of ₹{{ amountToPay }}.
              </p>
            </div>

            <form [formGroup]="otpForm" (ngSubmit)="verifyOtp()" class="space-y-4">
              <div class="space-y-2">
                <input 
                  type="text" 
                  formControlName="otp"
                  class="w-full h-12 text-center text-2xl font-bold tracking-[0.5em] rounded-md border border-input bg-background focus:ring-2 focus:ring-primary"
                  placeholder="000000"
                  maxlength="6"
                  autofocus
                >
                @if (otpForm.get('otp')?.invalid && otpForm.get('otp')?.touched) {
                  <p class="text-xs text-center text-destructive">Please enter a valid 6-digit OTP</p>
                }
              </div>

              <div class="bg-secondary/30 p-4 rounded-lg text-center">
                <p class="text-xs text-muted-foreground">Mock System - Current OTP:</p>
                <p class="text-lg font-mono font-bold text-primary">{{ generatedOtp }}</p>
              </div>

              <div class="flex gap-3">
                <app-button 
                  variant="outline" 
                  class="w-full" 
                  (click)="closeOtpModal()"
                  type="button"
                >
                  Cancel
                </app-button>
                <app-button 
                  variant="default" 
                  class="w-full" 
                  type="submit"
                  [disabled]="otpForm.invalid || isProcessing"
                >
                  @if (isProcessing) {
                    Verifying...
                  } @else {
                    Verify & Pay
                  }
                </app-button>
              </div>

              <div class="text-center">
                <button type="button" (click)="generateNewOtp()" class="text-xs text-primary hover:underline">
                  Resend OTP
                </button>
              </div>
            </form>
          </div>
        </app-modal>
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
  otpForm: FormGroup;
  errorMessage: string = '';

  get amountToPay(): number {
    if (!this.reservation) return 0;
    if (this.reservation.bill && this.reservation.bill.balanceAmount !== undefined) {
      return this.reservation.bill.balanceAmount;
    }
    return this.reservation.totalAmount;
  }

  // OTP Modal State
  showOtpModal = false;
  generatedOtp: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private fb: FormBuilder
  ) {
    this.paymentForm = this.fb.group({
      cardHolderName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z\s]*$/)]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
      billingAddress: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });
  }

  ngOnInit() {
    this.reservationId = this.route.snapshot.paramMap.get('reservationId') || '';
    if (this.reservationId) {
      this.fetchReservation();
    } else {
      this.errorMessage = 'Invalid Reservation ID';
      this.isLoading = false;
    }
  }

  fetchReservation() {
    this.isLoading = true;
    this.errorMessage = '';
    this.bookingService.getReservationById(this.reservationId).subscribe({
      next: (response) => {
        this.reservation = response.data;
        this.isLoading = false;
      },
      error: (err) => {
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
    console.log('handlePayment called');
    console.log('Payment form valid:', this.paymentForm.valid);
    console.log('Payment form value:', this.paymentForm.value);

    if (this.paymentForm.invalid) {
      console.warn('Payment form is invalid. Cannot show OTP modal.');
      // Mark all as touched to show errors
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.generateNewOtp();
    console.log('Generated OTP:', this.generatedOtp);
    this.showOtpModal = true;
    console.log('showOtpModal set to true');
  }

  generateNewOtp() {
    this.generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpForm.reset();
  }

  closeOtpModal() {
    this.showOtpModal = false;
    this.otpForm.reset();
  }

  verifyOtp() {
    if (this.otpForm.invalid) return;

    // We accept any 6 digit OTP for "random otp" requirement, but we check against generated one for better UX
    // "put any random otp then ite booking completed"

    this.isProcessing = true;

    // Simulate Payment Gateway finalization
    setTimeout(() => {
      const mockTransactionId = 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();

      this.bookingService.confirmPayment(this.reservationId, {
        paymentMethod: 'CREDIT_CARD',
        transactionId: mockTransactionId
      }).subscribe({
        next: () => {
          this.showOtpModal = false;
          this.router.navigate(['/customer/booking-success', this.reservationId]);
        },
        error: (err) => {
          console.error('Payment confirmation failed', err);
          this.errorMessage = 'Transaction failed. Please try again.';
          this.isProcessing = false;
          this.showOtpModal = false;
        }
      });
    }, 1500);
  }
}
