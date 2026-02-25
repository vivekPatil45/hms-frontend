import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Reservation } from '../../../models/reservation.model';
import { AdminReservationService } from '../../../core/services/admin-reservation.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdminCreateReservationModalComponent } from './admin-create-reservation-modal.component';
import { AdminEditReservationModalComponent } from './admin-edit-reservation-modal.component';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    ModalComponent,
    AdminCreateReservationModalComponent,
    AdminEditReservationModalComponent
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Reservations</h1>
          <p class="text-muted-foreground mt-1">
            Manage all hotel reservations
          </p>
        </div>
        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
            <div class="relative w-full sm:w-64">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                    type="text" 
                    [(ngModel)]="searchQuery" 
                    (keyup.enter)="loadReservations(0)"
                    placeholder="Search ID, customer, room..." 
                    class="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
            </div>
            <app-button variant="outline" (click)="toggleFilters()">
                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
            </app-button>
            <app-button (click)="openCreateReservationModal()">
                New Reservation
            </app-button>
        </div>
      </div>

      <!-- Filter Pane -->
      @if (showFilters) {
          <div class="bg-card border border-border rounded-xl p-4 animate-fade-in shadow-sm">
              <form [formGroup]="filterForm" (ngSubmit)="applyFilters()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div class="space-y-1">
                      <label class="text-xs font-medium text-muted-foreground">Status</label>
                      <select formControlName="status" class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                          <option [ngValue]="null">All Statuses</option>
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="CHECKED_IN">Checked In</option>
                          <option value="CHECKED_OUT">Checked Out</option>
                          <option value="CANCELLED">Cancelled</option>
                      </select>
                  </div>
                  <div class="space-y-1">
                      <label class="text-xs font-medium text-muted-foreground">Room Type</label>
                      <select formControlName="roomType" class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                          <option [ngValue]="null">All Types</option>
                          <option value="STANDARD">Standard</option>
                          <option value="DELUXE">Deluxe</option>
                          <option value="SUITE">Suite</option>
                          <option value="PRESIDENTIAL">Presidential</option>
                      </select>
                  </div>
                  <div class="space-y-1">
                      <label class="text-xs font-medium text-muted-foreground">From Date</label>
                      <input type="date" formControlName="dateFrom" class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                  </div>
                  <div class="space-y-1">
                      <label class="text-xs font-medium text-muted-foreground">To Date</label>
                      <input type="date" formControlName="dateTo" class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                  </div>
                  <div class="space-y-1">
                      <label class="text-xs font-medium text-muted-foreground">Booking Date</label>
                      <input type="date" formControlName="bookingDate" class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                  </div>
                  <div class="col-span-full flex justify-end gap-2 mt-2">
                      <app-button variant="ghost" size="sm" type="button" (click)="clearFilters()">Clear</app-button>
                      <app-button size="sm" type="submit">Apply Filters</app-button>
                  </div>
              </form>
          </div>
      }

      @if (isLoading) {
        <div class="flex justify-center py-12">
          <app-loading-spinner size="lg"></app-loading-spinner>
        </div>
      } @else if (errorMessage) {
        <div class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
          {{ errorMessage }}
        </div>
      } @else {
        <div class="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-muted/50 border-b border-border">
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">ID</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Customer</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Room</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Dates</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Total</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Status</th>
                  <th class="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (reservation of reservations; track reservation.reservationId) {
                  <tr class="hover:bg-muted/50 transition-colors">
                    <td class="py-3 px-4 font-medium text-foreground">
                        <span class="truncate block max-w-[100px]" [title]="reservation.reservationId">#{{ reservation.reservationId.substring(0, 8) }}</span>
                    </td>
                    <td class="py-3 px-4 text-sm text-foreground">
                        <div class="font-medium">{{ reservation.customer?.user?.fullName || 'Customer ' + reservation.customer?.customerId.substring(0,6) }}</div>
                        <div class="text-xs text-muted-foreground truncate max-w-[150px]">{{ reservation.customer?.user?.email || 'N/A' }}</div>
                    </td>
                    <td class="py-3 px-4 text-sm text-foreground">
                        <div class="font-medium">Room {{ reservation.room?.roomNumber }}</div>
                        <div class="text-xs text-muted-foreground">{{ reservation.room?.roomType }}</div>
                    </td>
                    <td class="py-3 px-4 text-sm text-foreground">
                        <div class="truncate">{{ reservation.checkInDate | date:'MMM d' }} - {{ reservation.checkOutDate | date:'MMM d, y' }}</div>
                        <div class="text-xs text-muted-foreground">{{ reservation.numberOfNights }} Nights</div>
                    </td>
                    <td class="py-3 px-4 text-sm font-medium text-foreground">₹{{ reservation.totalAmount }}</td>
                    <td class="py-3 px-4">
                      <app-status-badge [status]="reservation.status"></app-status-badge>
                    </td>
                    <td class="py-3 px-4 text-right">
                        @if (reservation.status !== 'CANCELLED' && reservation.status !== 'CHECKED_IN' && reservation.status !== 'CHECKED_OUT') {
                            <app-button variant="ghost" size="sm" class="mr-2" (click)="openEditModal(reservation)">
                                Edit
                            </app-button>
                            <app-button variant="destructive" size="sm" (click)="openCancelModal(reservation)">
                                Cancel
                            </app-button>
                        } @else {
                            <app-button variant="ghost" size="sm" (click)="openEditModal(reservation)" [disabled]="true">
                                View
                            </app-button>
                        }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="py-8 text-center text-muted-foreground">
                      No reservations found. Adjust filters or create a new reservation.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        @if (totalPages > 1) {
          <div class="flex justify-center gap-2 mt-4">
            <app-button 
              variant="outline" 
              size="sm" 
              [disabled]="currentPage === 0"
              (click)="loadReservations(currentPage - 1)"
            >
              Previous
            </app-button>
            <span class="px-4 py-2 text-sm text-muted-foreground flex items-center">
              Page {{ currentPage + 1 }} of {{ totalPages }}
            </span>
            <app-button 
              variant="outline" 
              size="sm" 
              [disabled]="currentPage === totalPages - 1"
              (click)="loadReservations(currentPage + 1)"
            >
              Next
            </app-button>
          </div>
        }
      }
    </div>

    <!-- Modals -->
    <app-admin-create-reservation-modal 
        [isOpen]="isCreateModalOpen" 
        (close)="isCreateModalOpen = false"
        (saved)="loadReservations(currentPage)">
    </app-admin-create-reservation-modal>

    <app-admin-edit-reservation-modal
        [isOpen]="isEditModalOpen"
        [reservation]="selectedReservation"
        (close)="closeEditModal()"
        (saved)="loadReservations(currentPage)">
    </app-admin-edit-reservation-modal>

    <app-modal
        [isOpen]="isCancelModalOpen"
        title="Confirm Cancellation"
        size="md"
        (close)="isCancelModalOpen = false"
    >
        <div class="p-4">
            <p class="text-foreground">Are you sure you want to cancel the reservation for <strong>{{ selectedReservation?.customer?.user?.fullName }}</strong>?</p>
            <p class="text-sm text-muted-foreground mt-2">This action is irreversible and the room will immediately be made available. Appropriate refunds will be logged if it was previously paid.</p>
            <div class="mt-6 flex justify-end gap-3">
                <app-button variant="ghost" (click)="isCancelModalOpen = false" [disabled]="isCancelling">Keep Reservation</app-button>
                <app-button variant="destructive" (click)="executeCancel()" [disabled]="isCancelling">
                    @if (isCancelling) {
                        <span>Cancelling...</span>
                    } @else {
                        <span>Confirm Cancel</span>
                    }
                </app-button>
            </div>
        </div>
    </app-modal>
  `,
  styles: []
})
export class AdminReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  isLoading = false;
  errorMessage = '';

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  filterForm: FormGroup;
  showFilters = false;
  searchQuery = '';
  activeFilters: any = {};

  // Modal State
  isCreateModalOpen = false;

  isEditModalOpen = false;
  selectedReservation: Reservation | null = null;

  isCancelModalOpen = false;
  isCancelling = false;

  constructor(
    private fb: FormBuilder,
    private adminReservationService: AdminReservationService,
    private toastService: ToastService
  ) {
    this.filterForm = this.fb.group({
      status: [null],
      roomType: [null],
      dateFrom: [null],
      dateTo: [null],
      bookingDate: [null]
    });
  }

  ngOnInit() {
    this.loadReservations();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    this.activeFilters = {
      status: this.filterForm.value.status || undefined,
      roomType: this.filterForm.value.roomType || undefined,
      dateFrom: this.filterForm.value.dateFrom || undefined,
      dateTo: this.filterForm.value.dateTo || undefined,
      bookingDate: this.filterForm.value.bookingDate || undefined
    };
    this.loadReservations(0);
  }

  clearFilters() {
    this.filterForm.reset({
      status: null,
      roomType: null,
      dateFrom: null,
      dateTo: null,
      bookingDate: null
    });
    this.searchQuery = '';
    this.activeFilters = {};
    this.loadReservations(0);
  }

  loadReservations(page: number = 0) {
    this.isLoading = true;
    this.errorMessage = '';
    this.currentPage = page;

    const filtersToApply = { ...this.activeFilters };
    if (this.searchQuery) {
      filtersToApply.searchQuery = this.searchQuery;
    }

    this.adminReservationService.getReservations(page, this.pageSize, filtersToApply).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.reservations = response.data.content;
          this.currentPage = response.data.page;
          this.pageSize = response.data.size;
          this.totalElements = response.data.totalElements;
          this.totalPages = response.data.totalPages;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load reservations';
        this.isLoading = false;
      }
    });
  }

  openCreateReservationModal() {
    this.isCreateModalOpen = true;
  }

  openEditModal(reservation: Reservation) {
    this.selectedReservation = reservation;
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.selectedReservation = null;
  }

  openCancelModal(reservation: Reservation) {
    this.selectedReservation = reservation;
    this.isCancelModalOpen = true;
  }

  executeCancel() {
    if (!this.selectedReservation) return;

    this.isCancelling = true;
    this.adminReservationService.cancelReservation(this.selectedReservation.reservationId).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Reservation successfully cancelled by admin.');
          this.isCancelModalOpen = false;
          this.isCancelling = false;
          this.selectedReservation = null;
          this.loadReservations(this.currentPage);
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to cancel reservation');
        this.isCancelling = false;
      }
    });
  }
}

