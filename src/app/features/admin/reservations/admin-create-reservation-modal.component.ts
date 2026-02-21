import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { Room } from '../../../models/room.model';
import { AdminRoomService } from '../../../core/services/admin-room.service';
import { AdminReservationService, AdminCreateReservationData } from '../../../core/services/admin-reservation.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-admin-create-reservation-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ModalComponent,
        ButtonComponent
    ],
    template: `
    <app-modal
      [isOpen]="isOpen"
      [title]="showSuccessScreen ? 'Reservation Created!' : 'Create New Reservation'"
      size="lg"
      (close)="onClose()"
    >
      @if (showSuccessScreen && createdReservationDetails) {
        <div class="p-6 text-center animate-fade-in">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-foreground mb-2">Reservation Successful!</h3>
          <p class="text-muted-foreground mb-6">Reservation #{{ createdReservationDetails.reservationId }} for {{ createdReservationDetails.customer?.user?.fullName }} has been confirmed.</p>
          
          <div class="flex justify-center gap-4">
            <app-button variant="outline" (click)="onClose()">Return to List</app-button>
            <app-button (click)="resetForm()">Create Another Reservation</app-button>
          </div>
        </div>
      } @else {
        <form [formGroup]="reservationForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-2 gap-4">
            
            <div class="space-y-2 col-span-2">
                <h4 class="text-sm font-semibold text-foreground border-b border-border pb-1">Customer Details</h4>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Customer Name *</label>
              <input
                type="text"
                formControlName="customerName"
                [ngClass]="{'border-destructive': f['customerName'].invalid && f['customerName'].touched}"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Customer Email *</label>
              <input
                type="email"
                formControlName="customerEmail"
                [ngClass]="{'border-destructive': f['customerEmail'].invalid && f['customerEmail'].touched}"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Customer Phone</label>
              <input
                type="tel"
                formControlName="customerPhone"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div class="space-y-2 col-span-2 mt-4">
                <h4 class="text-sm font-semibold text-foreground border-b border-border pb-1">Reservation Details</h4>
            </div>

            <div class="space-y-2 col-span-2">
              <label class="text-sm font-medium text-foreground">Available Room *</label>
              <select
                formControlName="roomId"
                [ngClass]="{'border-destructive': f['roomId'].invalid && f['roomId'].touched}"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="" disabled>Select Room</option>
                @for (room of availableRooms; track room.roomId) {
                    <option [value]="room.roomId">Room {{ room.roomNumber }} - {{ room.roomType }} (\${{ room.pricePerNight }}/night, Max: {{ room.maxOccupancy }})</option>
                }
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Check-in Date *</label>
              <input
                type="date"
                formControlName="checkInDate"
                [min]="minDate"
                [ngClass]="{'border-destructive': f['checkInDate'].invalid && f['checkInDate'].touched}"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Check-out Date *</label>
              <input
                type="date"
                formControlName="checkOutDate"
                [min]="f['checkInDate'].value || minDate"
                [ngClass]="{'border-destructive': f['checkOutDate'].invalid && f['checkOutDate'].touched}"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Number of Adults *</label>
              <input
                type="number"
                min="1"
                formControlName="numberOfAdults"
                [ngClass]="{'border-destructive': f['numberOfAdults'].invalid && f['numberOfAdults'].touched}"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Number of Children</label>
              <input
                type="number"
                min="0"
                formControlName="numberOfChildren"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div class="space-y-2 col-span-2">
              <label class="text-sm font-medium text-foreground">Payment Method</label>
              <select
                formControlName="paymentMethod"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>

            <div class="space-y-2 col-span-2">
              <label class="text-sm font-medium text-foreground">Special Requests</label>
              <textarea
                formControlName="specialRequests"
                rows="2"
                class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              ></textarea>
            </div>
          </div>

          @if (submitError) {
            <div class="mt-4 bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
              {{ submitError }}
            </div>
          }

          <div class="mt-6 flex justify-end gap-3">
            <app-button variant="ghost" (click)="onClose()" type="button" [disabled]="isSubmitting">
              Cancel
            </app-button>
            <app-button type="submit" [disabled]="isSubmitting">
              @if (isSubmitting) {
                <span>Processing...</span>
              } @else {
                <span>Create Reservation</span>
              }
            </app-button>
          </div>
        </form>
      }
    </app-modal>
  `
})
export class AdminCreateReservationModalComponent implements OnInit {
    @Input() isOpen = false;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();

    reservationForm: FormGroup;
    availableRooms: Room[] = [];

    isSubmitting = false;
    submitError = '';
    showSuccessScreen = false;
    createdReservationDetails: any = null;
    minDate: string;

    constructor(
        private fb: FormBuilder,
        private adminRoomService: AdminRoomService,
        private adminReservationService: AdminReservationService,
        private toastService: ToastService
    ) {
        const today = new Date();
        this.minDate = today.toISOString().split('T')[0];

        this.reservationForm = this.fb.group({
            customerName: ['', Validators.required],
            customerEmail: ['', [Validators.required, Validators.email]],
            customerPhone: [''],
            roomId: ['', Validators.required],
            checkInDate: ['', Validators.required],
            checkOutDate: ['', Validators.required],
            numberOfAdults: [1, [Validators.required, Validators.min(1)]],
            numberOfChildren: [0, Validators.min(0)],
            paymentMethod: ['CREDIT_CARD'],
            specialRequests: ['']
        });
    }

    ngOnInit() {
        this.loadAvailableRooms();
    }

    get f() {
        return this.reservationForm.controls;
    }

    loadAvailableRooms() {
        // Specifically fetch active, available rooms initially
        this.adminRoomService.getRooms({ availability: true, sortBy: 'roomNumber', sortOrder: 'asc' }, 0, 100).subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.availableRooms = response.data.content;
                }
            }
        });

        // You could also hook up date changes to refilter availableRooms based on checkInDate here
    }

    resetForm() {
        this.showSuccessScreen = false;
        this.createdReservationDetails = null;
        this.submitError = '';
        this.reservationForm.reset({
            numberOfAdults: 1,
            numberOfChildren: 0,
            paymentMethod: 'CREDIT_CARD'
        });
    }

    onSubmit() {
        if (this.reservationForm.invalid) {
            Object.keys(this.reservationForm.controls).forEach(key => {
                this.reservationForm.get(key)?.markAsTouched();
            });
            return;
        }

        this.isSubmitting = true;
        this.submitError = '';

        const payload: AdminCreateReservationData = this.reservationForm.value;

        this.adminReservationService.createReservation(payload).subscribe({
            next: (response) => {
                this.isSubmitting = false;
                if (response.success) {
                    this.toastService.success('Reservation created successfully.');
                    this.createdReservationDetails = response.data;
                    this.showSuccessScreen = true;
                    this.saved.emit();
                }
            },
            error: (error) => {
                this.isSubmitting = false;
                this.submitError = error.error?.message || 'Failed to create reservation.';
                this.toastService.error(this.submitError);
            }
        });
    }

    onClose() {
        this.resetForm();
        this.close.emit();
    }
}
