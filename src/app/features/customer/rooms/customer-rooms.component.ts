import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Room } from '../../../models/room.model';
import { RoomService, RoomSearchCriteria } from '../../../core/services/room.service';

@Component({
  selector: 'app-customer-rooms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Search Rooms</h1>
          <p class="text-muted-foreground mt-1">
            Find your perfect room for a comfortable stay
          </p>
        </div>
        
        <!-- Sorting -->
        <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-foreground">Sort by:</span>
            <select 
                [(ngModel)]="searchFilters.sortOrder" 
                (change)="handleSortChange()"
                class="h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
            </select>
        </div>
      </div>
      
      <!-- Search Filters -->
      <div class="bg-card p-6 rounded-xl border border-border shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
          <!-- Check-in Date -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Check-in</label>
            <input 
              type="date" 
              [(ngModel)]="searchFilters.checkInDate"
              class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              [min]="minDate"
            >
          </div>

          <!-- Check-out Date -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Check-out</label>
            <input 
              type="date" 
              [(ngModel)]="searchFilters.checkOutDate"
              class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              [min]="searchFilters.checkInDate || minDate"
            >
          </div>

          <!-- Room Type -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Type</label>
            <select 
              [(ngModel)]="searchFilters.roomType"
              class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="STANDARD">Standard</option>
              <option value="DELUXE">Deluxe</option>
              <option value="SUITE">Suite</option>
              <option value="PRESIDENTIAL">Presidential</option>
            </select>
          </div>

          <!-- Guests (Adults) -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Adults</label>
            <input 
              type="number" 
              min="1"
              max="10"
              [(ngModel)]="searchFilters.numberOfAdults"
              class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
          </div>

          <!-- Guests (Children) -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Children</label>
            <input 
              type="number" 
              min="0"
              max="5"
              [(ngModel)]="searchFilters.numberOfChildren"
              class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
          </div>

          <!-- Search Button -->
          <app-button (click)="handleSearch()" class="w-full" [disabled]="isLoading">
            Search
          </app-button>
        </div>
        
        <!-- Advanced Filters -->
        <div class="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Price Range -->
            <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Min Price</label>
                <input 
                    type="number" 
                    [(ngModel)]="searchFilters.minPrice" 
                    placeholder="Min"
                    class="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
            </div>
             <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Max Price</label>
                <input 
                    type="number" 
                    [(ngModel)]="searchFilters.maxPrice" 
                    placeholder="Max"
                    class="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
            </div>

            <!-- Amenities -->
            <div class="col-span-1 md:col-span-2 space-y-2">
                <label class="text-sm font-medium text-foreground">Amenities</label>
                <div class="flex flex-wrap gap-3">
                    @for (amenity of availableAmenities; track amenity) {
                        <label class="flex items-center space-x-2 text-sm text-foreground cursor-pointer">
                            <input 
                                type="checkbox" 
                                [checked]="selectedAmenities.includes(amenity)"
                                (change)="toggleAmenity(amenity)"
                                class="rounded border-input text-primary focus:ring-primary"
                            >
                            <span>{{ amenity }}</span>
                        </label>
                    }
                </div>
            </div>
        </div>
      </div>

      <!-- Error Message -->
      @if (errorMessage) {
        <div class="bg-destructive/10 text-destructive p-4 rounded-md text-center">
          {{ errorMessage }}
        </div>
      }

      @if (isLoading) {
        <div class="flex justify-center py-12">
          <app-loading-spinner size="lg"></app-loading-spinner>
        </div>
      } @else if (rooms.length === 0 && hasSearched) {
        <div class="text-center py-12 text-muted-foreground">
            <p class="text-lg">No rooms available for the selected dates and criteria.</p>
            <p class="text-sm">Please try different dates or room types.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (room of rooms; track room.roomId) {
            <div class="bg-card rounded-xl border border-border overflow-hidden card-hover group">
              <!-- Room Image -->
              <div class="h-48 bg-muted flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                @if (room.images && room.images.length > 0) {
                     <img [src]="room.images[0]" alt="Room Image" class="w-full h-full object-cover">
                } @else {
                    <div class="text-center text-muted-foreground">
                      <svg class="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p class="text-sm font-medium">Room {{ room.roomNumber }}</p>
                    </div>
                }
                
                <div class="absolute top-4 right-4">
                    <app-status-badge [status]="'AVAILABLE'"></app-status-badge>
                </div>
              </div>

              <!-- Room Details -->
              <div class="p-5 relative bg-card">
                <div class="mb-4">
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <h3 class="font-semibold text-lg text-foreground">{{ room.roomType }} Room</h3>
                      <p class="text-xs text-muted-foreground">Floor {{ room.floor }} • Room {{ room.roomNumber }}</p>
                    </div>
                    <div class="text-right">
                        <span class="text-xl font-bold text-primary">\${{ room.pricePerNight }}</span>
                        <span class="text-xs text-muted-foreground block">/night</span>
                    </div>
                  </div>
                  
                  <p class="text-sm text-muted-foreground mt-3 mb-4 line-clamp-2">
                    {{ room.description }}
                  </p>

                  <div class="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Up to {{ room.maxOccupancy }} guests</span>
                     <span class="mx-2">•</span>
                    <span>{{ room.roomSize }} sq ft</span>
                  </div>
                </div>

                <!-- Amenities -->
                <div class="flex flex-wrap gap-2 mb-6">
                  @for (amenity of room.amenities.slice(0, 4); track amenity) {
                    <span class="inline-flex items-center px-2 py-1 bg-secondary/50 rounded text-[10px] font-medium text-secondary-foreground">
                      <svg class="h-3 w-3 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {{ amenity }}
                    </span>
                  }
                </div>

                <app-button 
                    class="w-full"
                    (click)="bookRoom(room)"
                >
                  Book Now
                </app-button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class CustomerRoomsComponent implements OnInit {
  isLoading = false;
  hasSearched = false;
  errorMessage = '';
  minDate = new Date().toISOString().split('T')[0];

  // Available amenities for filtering, currently hardcoded
  availableAmenities = ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Bathtub', 'Balcony', 'Room Service', 'View'];
  selectedAmenities: string[] = [];

  searchFilters: RoomSearchCriteria = {
    checkInDate: '',
    checkOutDate: '',
    roomType: 'STANDARD',
    numberOfAdults: 1,
    numberOfChildren: 0,
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: 'pricePerNight',
    sortOrder: 'asc',
    amenities: []
  };

  rooms: Room[] = [];

  constructor(
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['checkIn'] && params['checkOut']) {
        this.searchFilters.checkInDate = params['checkIn'];
        this.searchFilters.checkOutDate = params['checkOut'];
        this.searchFilters.numberOfAdults = +params['adults'] || 1;
        this.searchFilters.numberOfChildren = +params['children'] || 0;
        if (params['type']) this.searchFilters.roomType = params['type'];

        // Optional filters
        if (params['minPrice']) this.searchFilters.minPrice = +params['minPrice'];
        if (params['maxPrice']) this.searchFilters.maxPrice = +params['maxPrice'];
        if (params['sortOrder']) this.searchFilters.sortOrder = params['sortOrder'];
        if (params['amenities']) {
          const amenitiesParam = params['amenities'];
          this.selectedAmenities = Array.isArray(amenitiesParam) ? amenitiesParam : [amenitiesParam];
          this.searchFilters.amenities = this.selectedAmenities;
        } else {
          this.selectedAmenities = [];
        }

        this.fetchRooms();
      }
    });
  }

  toggleAmenity(amenity: string) {
    if (this.selectedAmenities.includes(amenity)) {
      this.selectedAmenities = this.selectedAmenities.filter(a => a !== amenity);
    } else {
      this.selectedAmenities.push(amenity);
    }
    this.searchFilters.amenities = this.selectedAmenities;
  }

  handleSortChange() {
    this.handleSearch();
  }

  handleSearch() {
    // Update URL parameters which will trigger fetchRooms via subscription
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        checkIn: this.searchFilters.checkInDate,
        checkOut: this.searchFilters.checkOutDate,
        adults: this.searchFilters.numberOfAdults,
        children: this.searchFilters.numberOfChildren,
        type: this.searchFilters.roomType,
        minPrice: this.searchFilters.minPrice,
        maxPrice: this.searchFilters.maxPrice,
        sortOrder: this.searchFilters.sortOrder,
        amenities: this.selectedAmenities.length > 0 ? this.selectedAmenities : null
      },
      queryParamsHandling: 'merge'
    });
  }

  fetchRooms() {
    this.isLoading = true;
    this.errorMessage = '';
    this.hasSearched = true;

    this.roomService.searchRooms(this.searchFilters).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.rooms = response.data.content || [];
        } else {
          this.rooms = [];
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching rooms:', error);
        this.errorMessage = error.message || 'Failed to search rooms. Please try again.';
        this.isLoading = false;
      }
    });
  }

  bookRoom(room: Room) {
    this.router.navigate(['/customer/book', room.roomId], {
      queryParams: {
        checkIn: this.searchFilters.checkInDate,
        checkOut: this.searchFilters.checkOutDate,
        adults: this.searchFilters.numberOfAdults,
        children: this.searchFilters.numberOfChildren
      }
    });
  }
}
