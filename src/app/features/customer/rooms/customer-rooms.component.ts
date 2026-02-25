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
            <div class="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group">
              <!-- Room Image -->
              <div class="h-56 bg-muted overflow-hidden">
                @if (room.images && room.images.length > 0) {
                     <img [src]="room.images[0]" alt="Room Image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                } @else {
                    <img [src]="getRandomRoomImage(room.roomNumber)" alt="Default Room Image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                }
              </div>

              <!-- Room Details -->
              <div class="p-6">
                <!-- Header: Type & Status -->
                <div class="flex justify-between items-center mb-1">
                  <h3 class="text-xl font-bold text-foreground">{{ room.roomType }} Room</h3>
                  <div class="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                    AVAILABLE
                  </div>
                </div>

                <!-- Sub-info -->
                <p class="text-sm text-muted-foreground mb-3">
                  Floor {{ room.floor }} • Room {{ room.roomNumber }}
                </p>

                <!-- Description -->
                <p class="text-sm text-foreground/80 mb-4 line-clamp-2 min-h-[40px]">
                  {{ room.description }}
                </p>

                <!-- Amenities -->
                <div class="flex flex-wrap gap-2 mb-6">
                  @for (amenity of room.amenities.slice(0, 3); track amenity) {
                    <span class="inline-flex items-center text-[10px] bg-secondary/30 text-secondary-foreground px-2 py-0.5 rounded border border-border/50">
                      {{ amenity }}
                    </span>
                  }
                  @if (room.amenities.length > 3) {
                    <span class="text-[10px] text-muted-foreground self-center">+{{ room.amenities.length - 3 }} more</span>
                  }
                </div>

                <!-- Divider -->
                <div class="h-px bg-border/60 mb-6"></div>

                <!-- Bottom Row: Price & Action -->
                <div class="flex justify-between items-center">
                  <div class="flex items-baseline">
                    <span class="text-2xl font-bold text-foreground">₹{{ room.pricePerNight }}</span>
                    <span class="text-sm text-muted-foreground ml-1">/night</span>
                  </div>
                  <app-button 
                    size="sm" 
                    class="rounded-lg font-bold px-6 py-2 h-auto"
                    (click)="bookRoom(room)"
                  >
                    Book Now
                  </app-button>
                </div>
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
    // Frontend validation: check-out must be after check-in
    if (this.searchFilters.checkInDate && this.searchFilters.checkOutDate) {
      const checkIn = new Date(this.searchFilters.checkInDate);
      const checkOut = new Date(this.searchFilters.checkOutDate);
      if (checkOut <= checkIn) {
        this.errorMessage = 'Check-out date must be after the check-in date.';
        return;
      }
    }
    this.errorMessage = '';
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
        // Extract backend message from the error response body
        this.errorMessage = error.error?.message || error.message || 'Failed to search rooms. Please try again.';
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

  getRandomRoomImage(roomNumber: string): string {
    const images = ['room1.png', 'room2.png', 'room3.png', 'room4.png', 'room5.png'];
    // Use the room number string to generate a consistent index
    let hash = 0;
    for (let i = 0; i < roomNumber.length; i++) {
      hash = roomNumber.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % images.length;
    return `assets/${images[index]}`;
  }
}
