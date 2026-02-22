import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Room, CreateRoomData, UpdateRoomData, RoomFilterParams } from '../../../models/room.model';
import { AdminRoomService } from '../../../core/services/admin-room.service';
import { AdminRoomBulkImportComponent } from './admin-room-bulk-import.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-rooms',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonComponent,
    StatusBadgeComponent,
    ModalComponent,
    LoadingSpinnerComponent,
    AdminRoomBulkImportComponent
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Room Management</h1>
          <p class="text-muted-foreground mt-1">
            Manage hotel rooms and their availability
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
                    (keyup.enter)="loadRooms(0)"
                    placeholder="Search room # or type..." 
                    class="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
            </div>
            <app-button variant="outline" (click)="toggleFilters()">
                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
            </app-button>
            <app-button variant="outline" (click)="openBulkImportModal()">
                Bulk Import
            </app-button>
            <app-button (click)="openAddRoomModal()">
                Add Room
            </app-button>
        </div>
      </div>

      <!-- Filter Pane -->
      @if (showFilters) {
          <div class="bg-card border border-border rounded-xl p-4 animate-fade-in shadow-sm">
              <form [formGroup]="filterForm" (ngSubmit)="applyFilters()" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                      <label class="text-xs font-medium text-muted-foreground">Min Price</label>
                      <input type="number" formControlName="minPrice" class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" placeholder="Min $">
                  </div>
                  <div class="space-y-1">
                      <label class="text-xs font-medium text-muted-foreground">Max Price</label>
                      <input type="number" formControlName="maxPrice" class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" placeholder="Max $">
                  </div>
                  <div class="space-y-1">
                      <label class="text-xs font-medium text-muted-foreground">Free On Date</label>
                      <input type="date" formControlName="availabilityDate" class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                  </div>
                  <div class="space-y-1">
                      <label class="text-xs font-medium text-muted-foreground">Maintenance Status</label>
                      <select formControlName="availability" class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                          <option [ngValue]="null">Any</option>
                          <option [ngValue]="true">Active</option>
                          <option [ngValue]="false">Under Maintenance</option>
                      </select>
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
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm cursor-pointer hover:text-foreground" (click)="sortBy('roomNumber')">
                    Room # <span class="text-xs">{{ getSortIcon('roomNumber') }}</span>
                  </th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm cursor-pointer hover:text-foreground" (click)="sortBy('roomType')">
                    Type <span class="text-xs">{{ getSortIcon('roomType') }}</span>
                  </th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm cursor-pointer hover:text-foreground" (click)="sortBy('floor')">
                    Floor <span class="text-xs">{{ getSortIcon('floor') }}</span>
                  </th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm cursor-pointer hover:text-foreground" (click)="sortBy('maxOccupancy')">
                    Capacity <span class="text-xs">{{ getSortIcon('maxOccupancy') }}</span>
                  </th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm cursor-pointer hover:text-foreground" (click)="sortBy('pricePerNight')">
                    Price/Night <span class="text-xs">{{ getSortIcon('pricePerNight') }}</span>
                  </th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                    Amenities
                  </th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                    Status
                  </th>
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
                    <td class="py-3 px-4 text-sm text-muted-foreground truncate max-w-[150px]" [title]="room.amenities.join(', ') || 'None'">
                        {{ room.amenities.join(', ') || 'None' }}
                    </td>
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
                    <td colspan="8" class="py-8 text-center text-muted-foreground">
                      No rooms found. Try changing filters or click "Add Room" to create one.
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
            <span class="px-4 py-2 text-sm text-muted-foreground flex items-center">
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

    <!-- Confirmation Modal -->
    <app-modal
        [isOpen]="isConfirmModalOpen"
        title="Confirm Modification"
        size="md"
        (close)="isConfirmModalOpen = false"
    >
        <div class="p-4">
            <p class="text-foreground">Are you sure you want to update the details for Room {{ selectedRoom?.roomNumber }}?</p>
            <div class="mt-6 flex justify-end gap-3">
                <app-button variant="ghost" (click)="isConfirmModalOpen = false">Cancel</app-button>
                <app-button variant="default" (click)="executeSave()">Confirm Update</app-button>
            </div>
        </div>
    </app-modal>

    <!-- Add/Edit Room Modal -->
    <app-modal
      [isOpen]="isModalOpen"
      [title]="showSuccessScreen ? 'Room Added!' : (isEditMode ? 'Edit Room' : 'Add New Room')"
      size="lg"
      (close)="closeModal()"
    >
      @if (showSuccessScreen && addedRoomDetails) {
        <div class="p-6 text-center animate-fade-in">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-foreground mb-2">Room Added Successfully!</h3>
          <p class="text-muted-foreground mb-6">Room {{ addedRoomDetails.roomNumber }} ({{ addedRoomDetails.roomType }}) has been successfully mapped to the inventory.</p>
          
          <div class="flex justify-center gap-4">
            <app-button variant="outline" (click)="closeModal()">Return to List</app-button>
            <app-button (click)="addAnotherRoom()">Add Another Room</app-button>
          </div>
        </div>
      } @else {
        <form [formGroup]="roomForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-2 gap-4">
            @if (isEditMode && selectedRoom) {
              <div class="space-y-2 col-span-2">
                <label class="text-sm font-medium text-muted-foreground">Room Number</label>
                <input
                  type="text"
                  [value]="selectedRoom.roomNumber"
                  disabled
                  class="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm cursor-not-allowed"
                />
              </div>
            }

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Room Type *</label>
              <select
                formControlName="roomType"
                [ngClass]="{'border-destructive': roomForm.get('roomType')?.invalid && roomForm.get('roomType')?.touched}"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="" disabled>Select Type</option>
                <option value="STANDARD">Standard</option>
                <option value="DELUXE">Deluxe</option>
                <option value="SUITE">Suite</option>
                <option value="PRESIDENTIAL">Presidential</option>
              </select>
              @if (roomForm.get('roomType')?.invalid && roomForm.get('roomType')?.touched) {
                <span class="text-xs text-destructive">Room Type is required.</span>
              }
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
                [ngClass]="{'border-destructive': roomForm.get('floor')?.invalid && roomForm.get('floor')?.touched}"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              @if (roomForm.get('floor')?.invalid && roomForm.get('floor')?.touched) {
                <span class="text-xs text-destructive">Valid positive floor is required.</span>
              }
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Max Occupancy *</label>
              <input
                type="number"
                formControlName="maxOccupancy"
                min="1"
                [ngClass]="{'border-destructive': roomForm.get('maxOccupancy')?.invalid && roomForm.get('maxOccupancy')?.touched}"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              @if (roomForm.get('maxOccupancy')?.invalid && roomForm.get('maxOccupancy')?.touched) {
                <span class="text-xs text-destructive">Valid positive integer is required for capacity.</span>
              }
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Price per Night ($) *</label>
              <input
                type="number"
                formControlName="pricePerNight"
                min="0.01"
                step="0.01"
                [ngClass]="{'border-destructive': roomForm.get('pricePerNight')?.invalid && roomForm.get('pricePerNight')?.touched}"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              @if (roomForm.get('pricePerNight')?.invalid && roomForm.get('pricePerNight')?.touched) {
                <span class="text-xs text-destructive">Valid strictly positive price is required.</span>
              }
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Room Size (sq ft) *</label>
              <input
                type="number"
                formControlName="roomSize"
                min="1"
                [ngClass]="{'border-destructive': roomForm.get('roomSize')?.invalid && roomForm.get('roomSize')?.touched}"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              @if (roomForm.get('roomSize')?.invalid && roomForm.get('roomSize')?.touched) {
                <span class="text-xs text-destructive">Valid positive size is required.</span>
              }
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
                <option [ngValue]="true">Available</option>
                <option [ngValue]="false">Not Available (Maintenance)</option>
              </select>
            </div>
            
            <div class="space-y-2 col-span-2">
              <label class="text-sm font-medium text-foreground">Amenities (Optional)</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                @for (amenity of predefinedAmenities; track amenity) {
                  <label class="flex items-center space-x-2 text-sm cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="rounded border-input text-primary focus:ring-primary"
                      [checked]="selectedAmenities.has(amenity)"
                      (change)="toggleAmenity(amenity)"
                    >
                    <span>{{ amenity }}</span>
                  </label>
                }
              </div>
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
            <app-button type="submit" [disabled]="isSubmitting">
              @if (isSubmitting) {
                <span>Saving...</span>
              } @else {
                <span>{{ isEditMode ? 'Review Updates' : 'Add Room' }}</span>
              }
            </app-button>
          </div>
        </form>
      }
    </app-modal>
  `,
  styles: []
})
export class AdminRoomsComponent implements OnInit {
  rooms: Room[] = [];
  isLoading = false;
  isModalOpen = false;
  isBulkImportOpen = false;
  isConfirmModalOpen = false;
  isEditMode = false;
  isSubmitting = false;
  errorMessage = '';
  submitError = '';
  selectedRoom: Room | null = null;

  showSuccessScreen = false;
  addedRoomDetails: Room | null = null;

  predefinedAmenities = ['Wi-Fi', 'Air Conditioning', 'TV', 'Mini-Bar', 'Room Service', 'Ocean View', 'Balcony', 'King Bed'];
  selectedAmenities: Set<string> = new Set();

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  roomForm: FormGroup;
  filterForm: FormGroup;
  showFilters = false;
  searchQuery = '';

  filters: RoomFilterParams = {
    sortBy: 'roomNumber',
    sortOrder: 'asc'
  };

  constructor(
    private fb: FormBuilder,
    private adminRoomService: AdminRoomService,
    private toastService: ToastService
  ) {
    this.roomForm = this.fb.group({
      roomType: ['', Validators.required],
      bedType: ['DOUBLE', Validators.required],
      floor: [1, [Validators.required, Validators.min(1)]],
      maxOccupancy: [2, [Validators.required, Validators.min(1)]],
      pricePerNight: [150, [Validators.required, Validators.min(0.01)]],
      roomSize: [300, [Validators.required, Validators.min(1)]],
      viewType: ['CITY', Validators.required],
      availability: [true, Validators.required],
      description: ['']
    });

    this.filterForm = this.fb.group({
      roomType: [null],
      minPrice: [null],
      maxPrice: [null],
      availabilityDate: [null],
      availability: [null]
    });
  }

  ngOnInit() {
    this.loadRooms();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    const values = this.filterForm.value;
    this.filters = {
      ...this.filters,
      roomType: values.roomType || undefined,
      minPrice: values.minPrice || undefined,
      maxPrice: values.maxPrice || undefined,
      availabilityDate: values.availabilityDate || undefined,
      availability: values.availability !== null ? values.availability : undefined
    };
    this.loadRooms(0);
  }

  clearFilters() {
    this.filterForm.reset({
      roomType: null,
      minPrice: null,
      maxPrice: null,
      availabilityDate: null,
      availability: null
    });
    this.searchQuery = '';
    this.filters = { sortBy: 'roomNumber', sortOrder: 'asc' };
    this.loadRooms(0);
  }

  sortBy(column: string) {
    if (this.filters.sortBy === column) {
      this.filters.sortOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.filters.sortBy = column;
      this.filters.sortOrder = 'asc';
    }
    this.loadRooms(0);
  }

  getSortIcon(column: string): string {
    if (this.filters.sortBy !== column) return '↕';
    return this.filters.sortOrder === 'asc' ? '↑' : '↓';
  }

  loadRooms(page: number = 0) {
    this.isLoading = true;
    this.errorMessage = '';
    this.currentPage = page;

    const currentFilters = { ...this.filters };
    if (this.searchQuery) {
      currentFilters.searchQuery = this.searchQuery;
    }

    this.adminRoomService.getRooms(currentFilters, page, this.pageSize).subscribe({
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
    this.showSuccessScreen = false;
    this.addedRoomDetails = null;
    this.selectedAmenities.clear();

    this.roomForm.reset({
      roomType: '',
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

  addAnotherRoom() {
    this.openAddRoomModal();
  }

  openEditRoomModal(room: Room) {
    this.isEditMode = true;
    this.selectedRoom = room;
    this.showSuccessScreen = false;
    this.addedRoomDetails = null;
    this.selectedAmenities = new Set(room.amenities || []);

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
    this.showSuccessScreen = false;
  }

  openBulkImportModal() {
    this.isBulkImportOpen = true;
  }

  closeBulkImportModal() {
    this.isBulkImportOpen = false;
    this.loadRooms(this.currentPage);
  }

  toggleAmenity(amenity: string) {
    if (this.selectedAmenities.has(amenity)) {
      this.selectedAmenities.delete(amenity);
    } else {
      this.selectedAmenities.add(amenity);
    }
  }

  onSubmit() {
    if (this.roomForm.invalid) {
      // Mark all as touched to trigger validation messages safely
      Object.keys(this.roomForm.controls).forEach(key => {
        this.roomForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.isEditMode) {
      this.isConfirmModalOpen = true;
    } else {
      this.executeSave();
    }
  }

  executeSave() {
    this.isConfirmModalOpen = false;
    this.isSubmitting = true;
    this.submitError = '';

    const formData = this.roomForm.value;

    const roomData = {
      ...formData,
      amenities: Array.from(this.selectedAmenities),
      images: []
    };

    const request = this.isEditMode && this.selectedRoom
      ? this.adminRoomService.updateRoom(this.selectedRoom.roomId, roomData as UpdateRoomData)
      : this.adminRoomService.createRoom(roomData as CreateRoomData);

    request.subscribe({
      next: (response) => {
        this.isSubmitting = false;

        if (this.isEditMode) {
          this.toastService.success(`Room ${this.selectedRoom?.roomNumber || ''} details are updated successfully.`);
          this.closeModal();
          this.loadRooms(this.currentPage);
        } else {
          // New "Add Another" modal success screen execution
          this.toastService.success(`Room added successfully.`);
          this.addedRoomDetails = response.data || roomData; // fallback
          this.showSuccessScreen = true;
          this.loadRooms(0);
        }
      },
      error: (error) => {
        this.submitError = error.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} room`;
        this.toastService.error(this.submitError);
        this.isSubmitting = false;
      }
    });
  }
}
