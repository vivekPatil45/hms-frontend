import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Room, CreateRoomData, UpdateRoomData } from '../../../models/room.model';
import { AdminRoomService } from '../../../core/services/admin-room.service';
import { AdminRoomBulkImportComponent } from './admin-room-bulk-import.component';

@Component({
  selector: 'app-admin-rooms',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    StatusBadgeComponent,
    ModalComponent,
    LoadingSpinnerComponent,
    AdminRoomBulkImportComponent
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Room Management</h1>
          <p class="text-muted-foreground mt-1">
            Manage hotel rooms and their availability
          </p>
        </div>
        <div class="flex gap-2">
            <app-button variant="outline" (click)="openBulkImportModal()">
                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Bulk Import
            </app-button>
            <app-button (click)="openAddRoomModal()">
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Room
            </app-button>
        </div>
      </div>

      @if (isLoading) {
        <div class="flex justify-center py-12">
          <app-loading-spinner size="lg"></app-loading-spinner>
        </div>
      } @else if (errorMessage) {
        <div class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
          {{ errorMessage }}
        </div>
      } @else {
        <div class="bg-card rounded-xl border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-muted/50 border-b border-border">
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Room #</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Type</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Floor</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Capacity</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Price/Night</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Status</th>
                  <th class="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (room of rooms; track room.roomId) {
                  <tr class="hover:bg-muted/50 transition-colors">
                    <td class="py-3 px-4 font-medium text-foreground">{{ room.roomNumber }}</td>
                    <td class="py-3 px-4 text-sm text-foreground">{{ room.roomType }}</td>
                    <td class="py-3 px-4 text-sm text-foreground">{{ room.floor }}</td>
                    <td class="py-3 px-4 text-sm text-foreground">{{ room.maxOccupancy }}</td>
                    <td class="py-3 px-4 text-sm font-medium text-foreground">\${{ room.pricePerNight }}</td>
                    <td class="py-3 px-4">
                      <app-status-badge [status]="room.currentStatus || 'AVAILABLE'"></app-status-badge>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <app-button variant="ghost" size="sm" class="mr-2" (click)="openEditRoomModal(room)">
                        Edit
                      </app-button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="py-8 text-center text-muted-foreground">
                      No rooms found. Click "Add Room" to create one.
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
              (click)="loadRooms(currentPage - 1)"
            >
              Previous
            </app-button>
            <span class="px-4 py-2 text-sm text-muted-foreground">
              Page {{ currentPage + 1 }} of {{ totalPages }}
            </span>
            <app-button 
              variant="outline" 
              size="sm" 
              [disabled]="currentPage === totalPages - 1"
              (click)="loadRooms(currentPage + 1)"
            >
              Next
            </app-button>
          </div>
        }
      }
    </div>

    <!-- Bulk Import Modal -->
    <app-modal
        [isOpen]="isBulkImportOpen"
        title="Bulk Import Rooms"
        size="lg"
        (close)="closeBulkImportModal()"
    >
        <app-admin-room-bulk-import></app-admin-room-bulk-import>
    </app-modal>

    <!-- Add/Edit Room Modal -->
    <app-modal
      [isOpen]="isModalOpen"
      [title]="isEditMode ? 'Edit Room' : 'Add New Room'"
      size="lg"
      (close)="closeModal()"
    >
      <form [formGroup]="roomForm" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-2 gap-4">
          @if (isEditMode && selectedRoom) {
            <div class="space-y-2 col-span-2">
              <label class="text-sm font-medium text-muted-foreground">Room Number</label>
              <input
                type="text"
                [value]="selectedRoom.roomNumber"
                disabled
                class="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
              />
            </div>
          }

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Room Type *</label>
            <select
              formControlName="roomType"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="STANDARD">Standard</option>
              <option value="DELUXE">Deluxe</option>
              <option value="SUITE">Suite</option>
              <option value="PRESIDENTIAL">Presidential</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Bed Type *</label>
            <select
              formControlName="bedType"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="SINGLE">Single</option>
              <option value="DOUBLE">Double</option>
              <option value="QUEEN">Queen</option>
              <option value="KING">King</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Floor *</label>
            <input
              type="number"
              formControlName="floor"
              min="1"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Max Occupancy *</label>
            <input
              type="number"
              formControlName="maxOccupancy"
              min="1"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Price per Night *</label>
            <input
              type="number"
              formControlName="pricePerNight"
              min="0"
              step="0.01"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Room Size (sq ft) *</label>
            <input
              type="number"
              formControlName="roomSize"
              min="1"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">View Type *</label>
            <select
              formControlName="viewType"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="CITY">City View</option>
              <option value="GARDEN">Garden View</option>
              <option value="OCEAN">Ocean View</option>
              <option value="MOUNTAIN">Mountain View</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Availability *</label>
            <select
              formControlName="availability"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option [value]="true">Available</option>
              <option [value]="false">Under Maintenance</option>
            </select>
          </div>

          <div class="space-y-2 col-span-2">
            <label class="text-sm font-medium text-foreground">Description</label>
            <textarea
              formControlName="description"
              rows="3"
              maxlength="500"
              class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            ></textarea>
          </div>
        </div>

        @if (submitError) {
          <div class="mt-4 bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
            {{ submitError }}
          </div>
        }

        <div class="mt-6 flex justify-end gap-3" footer>
          <app-button variant="ghost" (click)="closeModal()" type="button" [disabled]="isSubmitting">
            Cancel
          </app-button>
          <app-button type="submit" [disabled]="roomForm.invalid || isSubmitting">
            @if (isSubmitting) {
              <span>Saving...</span>
            } @else {
              <span>{{ isEditMode ? 'Update Room' : 'Add Room' }}</span>
            }
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
  styles: []
})
export class AdminRoomsComponent implements OnInit {
  rooms: Room[] = [];
  isLoading = false;
  isModalOpen = false;
  isBulkImportOpen = false;
  isEditMode = false;
  isSubmitting = false;
  errorMessage = '';
  submitError = '';
  selectedRoom: Room | null = null;

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  roomForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private adminRoomService: AdminRoomService
  ) {
    this.roomForm = this.fb.group({
      roomType: ['STANDARD', Validators.required],
      bedType: ['DOUBLE', Validators.required],
      floor: [1, [Validators.required, Validators.min(1)]],
      maxOccupancy: [2, [Validators.required, Validators.min(1)]],
      pricePerNight: [150, [Validators.required, Validators.min(0.01)]],
      roomSize: [300, [Validators.required, Validators.min(1)]],
      viewType: ['CITY', Validators.required],
      availability: [true, Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms(page: number = 0) {
    this.isLoading = true;
    this.errorMessage = '';
    this.currentPage = page;

    this.adminRoomService.getRooms({}, page, this.pageSize).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.rooms = response.data.content;
          this.currentPage = response.data.page;
          this.pageSize = response.data.size;
          this.totalElements = response.data.totalElements;
          this.totalPages = response.data.totalPages;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load rooms';
        this.isLoading = false;
      }
    });
  }

  openAddRoomModal() {
    this.isEditMode = false;
    this.selectedRoom = null;
    this.roomForm.reset({
      roomType: 'STANDARD',
      bedType: 'DOUBLE',
      floor: 1,
      maxOccupancy: 2,
      pricePerNight: 150,
      roomSize: 300,
      viewType: 'CITY',
      availability: true,
      description: ''
    });
    this.submitError = '';
    this.isModalOpen = true;
  }

  openEditRoomModal(room: Room) {
    this.isEditMode = true;
    this.selectedRoom = room;
    this.roomForm.patchValue({
      roomType: room.roomType,
      bedType: room.bedType,
      floor: room.floor,
      maxOccupancy: room.maxOccupancy,
      pricePerNight: room.pricePerNight,
      roomSize: room.roomSize,
      viewType: room.viewType,
      availability: room.availability,
      description: room.description || ''
    });
    this.submitError = '';
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.roomForm.reset();
    this.selectedRoom = null;
    this.submitError = '';
  }

  openBulkImportModal() {
    this.isBulkImportOpen = true;
  }

  closeBulkImportModal() {
    this.isBulkImportOpen = false;
    // Reload rooms after import modal close to reflect changes
    this.loadRooms(this.currentPage);
  }

  onSubmit() {
    if (this.roomForm.invalid) return;

    this.isSubmitting = true;
    this.submitError = '';

    const formData = this.roomForm.value;
    const roomData = {
      ...formData,
      amenities: [],
      images: []
    };

    const request = this.isEditMode && this.selectedRoom
      ? this.adminRoomService.updateRoom(this.selectedRoom.roomId, roomData as UpdateRoomData)
      : this.adminRoomService.createRoom(roomData as CreateRoomData);

    request.subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.closeModal();
        this.loadRooms(this.currentPage);
      },
      error: (error) => {
        this.submitError = error.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} room`;
        this.isSubmitting = false;
      }
    });
  }
}
