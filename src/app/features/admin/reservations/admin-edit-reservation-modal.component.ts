import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { Room } from '../../../models/room.model';
import { Reservation } from '../../../models/reservation.model';
import { AdminRoomService } from '../../../core/services/admin-room.service';
import { AdminReservationService, ModifyReservationData } from '../../../core/services/admin-reservation.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-admin-edit-reservation-modal',
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
      title="Edit Reservation"
      size="lg"
      (close)="onClose()"
    >
        <form [formGroup]="editForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-2 gap-4">
            
            <div class="space-y-2 col-span-2">
                <div class="bg-muted p-3 rounded-md text-sm">
                    <strong>Reservation ID:</strong> #{{ reservation?.reservationId }} <br/>
                    <strong>Customer:</strong> {{ reservation?.customer?.user?.fullName }} ({{ reservation?.customer?.user?.email }})
                </div>
            </div>

            <div class="space-y-2 col-span-2 mt-2">
                <h4 class="text-sm font-semibold text-foreground border-b border-border pb-1">Update Details</h4>
            </div>

            <div class="space-y-2 col-span-2">
              <label class="text-sm font-medium text-foreground">Reassign Room *</label>
              <select
                formControlName="roomId"
                [ngClass]="{'border-destructive': f['roomId'].invalid && f['roomId'].touched}"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="" disabled>Select Room</option>
                @for (room of availableRooms; track room.roomId) {
                    <option [value]="room.roomId">
                        Room {{ room.roomNumber }} - {{ room.roomType }} 
                        @if (room.roomId === reservation?.room?.roomId) { (Current) }
                    </option>
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
                <span>Updating...</span>
              } @else {
                <span>Save Changes</span>
              }
            </app-button>
          </div>
        </form>
    </app-modal>
  `
})
export class AdminEditReservationModalComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() reservation: Reservation | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();

    editForm: FormGroup;
    availableRooms: Room[] = [];

    isSubmitting = false;
    submitError = '';
    minDate: string;

    constructor(
        private fb: FormBuilder,
        private adminRoomService: AdminRoomService,
        private adminReservationService: AdminReservationService,
        private toastService: ToastService
    ) {
        const today = new Date();
        this.minDate = today.toISOString().split('T')[0];

        this.editForm = this.fb.group({
            roomId: ['', Validators.required],
            checkInDate: ['', Validators.required],
            checkOutDate: ['', Validators.required],
            numberOfAdults: [1, [Validators.required, Validators.min(1)]],
            numberOfChildren: [0, Validators.min(0)],
            specialRequests: ['']
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isOpen'] && this.isOpen) {
            this.loadAvailableRooms();
            this.patchFormValues();
        }
    }

    get f() {
        return this.editForm.controls;
    }

    loadAvailableRooms() {
        // Load all rooms (or a wide pagination) so they can reassign easily
        this.adminRoomService.getRooms({ sortBy: 'roomNumber', sortOrder: 'asc' }, 0, 100).subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.availableRooms = response.data.content;
                }
            }
        });
    }

    patchFormValues() {
        this.submitError = '';
        if (this.reservation) {
            this.editForm.patchValue({
                roomId: this.reservation.room?.roomId || '',
                checkInDate: this.reservation.checkInDate,
                checkOutDate: this.reservation.checkOutDate,
                numberOfAdults: this.reservation.numberOfAdults,
                numberOfChildren: this.reservation.numberOfChildren,
                specialRequests: this.reservation.specialRequests || ''
            });
        }
    }

    onSubmit() {
        if (this.editForm.invalid || !this.reservation) {
            Object.keys(this.editForm.controls).forEach(key => {
                this.editForm.get(key)?.markAsTouched();
            });
            return;
        }

        this.isSubmitting = true;
        this.submitError = '';

        const payload: ModifyReservationData = this.editForm.value;

        this.adminReservationService.updateReservation(this.reservation.reservationId, payload).subscribe({
            next: (response) => {
                this.isSubmitting = false;
                if (response.success) {
                    this.toastService.success('Reservation updated successfully.');
                    this.saved.emit();
                    this.onClose();
                }
            },
            error: (error) => {
                this.isSubmitting = false;
                this.submitError = error.error?.message || 'Failed to update reservation due to conflicts or errors.';
                this.toastService.error(this.submitError);
            }
        });
    }

    onClose() {
        this.editForm.reset();
        this.close.emit();
    }
}
