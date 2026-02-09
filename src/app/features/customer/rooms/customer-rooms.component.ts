import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Room } from '../../../models/room.model';
import { ROOM_AMENITIES } from '../../../shared/utils/constants';

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
      <div>
        <h1 class="text-3xl font-bold text-foreground">Search Rooms</h1>
        <p class="text-muted-foreground mt-1">
          Find your perfect room for a comfortable stay
        </p>
      </div>
      
      <!-- Search Filters -->
      <div class="bg-card p-6 rounded-xl border border-border shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <!-- Check-in Date -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Check-in Date</label>
            <div class="relative">
              <input 
                type="date" 
                [(ngModel)]="searchFilters.checkIn"
                class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
            </div>
          </div>

          <!-- Check-out Date -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Check-out Date</label>
            <div class="relative">
              <input 
                type="date" 
                [(ngModel)]="searchFilters.checkOut"
                class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
            </div>
          </div>

          <!-- Room Type -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Room Type</label>
            <select 
              [(ngModel)]="searchFilters.type"
              class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="ALL">All Types</option>
              <option value="STANDARD">Standard</option>
              <option value="DELUXE">Deluxe</option>
              <option value="SUITE">Suite</option>
              <option value="PRESIDENTIAL">Presidential</option>
            </select>
          </div>

          <!-- Guests -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Guests</label>
            <input 
              type="number" 
              min="1"
              [(ngModel)]="searchFilters.guests"
              class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
          </div>

          <!-- Search Button -->
          <app-button (click)="handleSearch()" class="w-full">
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </app-button>
        </div>
      </div>

      @if (isLoading) {
        <div class="flex justify-center py-12">
          <app-loading-spinner size="lg"></app-loading-spinner>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (room of filteredRooms; track room.roomId) {
            <div class="bg-card rounded-xl border border-border overflow-hidden card-hover group">
              <!-- Room Image -->
              <div class="h-48 bg-muted flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                <div class="text-center text-muted-foreground">
                  <svg class="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p class="text-sm font-medium">Room {{ room.roomNumber }}</p>
                </div>
                <div class="absolute top-4 right-4">
                    <app-status-badge [status]="room.currentStatus || 'AVAILABLE'"></app-status-badge>
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
                    @if (room.currentStatus === 'OCCUPIED' || room.currentStatus === 'MAINTENANCE') {
                        <div class="text-right opacity-50">
                           <span class="text-xl font-bold text-foreground">\${{ room.pricePerNight }}</span>
                           <span class="text-xs text-muted-foreground block">/night</span>
                        </div>
                    } @else {
                        <div class="text-right">
                           <span class="text-xl font-bold text-primary">\${{ room.pricePerNight }}</span>
                           <span class="text-xs text-muted-foreground block">/night</span>
                        </div>
                    }
                  </div>
                  
                  <p class="text-sm text-muted-foreground mt-3 mb-4 line-clamp-2">
                    {{ room.description }}
                  </p>

                  <div class="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Up to {{ room.maxOccupancy }} guests</span>
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
                    [disabled]="room.currentStatus !== 'AVAILABLE'"
                    [variant]="room.currentStatus === 'AVAILABLE' ? 'default' : 'secondary'"
                >
                  {{ room.currentStatus === 'AVAILABLE' ? 'Book Now' : 'Not Available' }}
                </app-button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: []
})
export class CustomerRoomsComponent {
  isLoading = false;

  searchFilters = {
    checkIn: '',
    checkOut: '',
    type: 'ALL',
    guests: 1
  };

  rooms: Room[] = [
    {
      roomId: '1',
      roomNumber: '101',
      roomType: 'STANDARD',
      bedType: 'SINGLE',
      floor: 1,
      pricePerNight: 99,
      currentStatus: 'AVAILABLE',
      description: 'Cozy standard room with city view, perfect for solo travelers.',
      amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'],
      maxOccupancy: 1,
      availability: true,
      roomSize: 200,
      viewType: 'CITY',
      images: []
    },
    {
      roomId: '4',
      roomNumber: '102',
      roomType: 'STANDARD',
      bedType: 'DOUBLE',
      floor: 1,
      pricePerNight: 149,
      currentStatus: 'OCCUPIED',
      description: 'Spacious standard room with modern amenities and garden view.',
      amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'],
      maxOccupancy: 2,
      availability: false,
      roomSize: 300,
      viewType: 'GARDEN',
      images: []
    },
    {
      roomId: '2',
      roomNumber: '205',
      roomType: 'SUITE',
      bedType: 'KING',
      floor: 2,
      pricePerNight: 450,
      currentStatus: 'AVAILABLE',
      description: 'Luxurious suite featuring separate living area, premium furnishings, and panoramic views of the skyline.',
      amenities: ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Bathtub', 'Balcony'],
      maxOccupancy: 3,
      availability: true,
      roomSize: 500,
      viewType: 'CITY',
      images: []
    },
    {
      roomId: '3',
      roomNumber: '301',
      roomType: 'DELUXE',
      bedType: 'QUEEN',
      floor: 3,
      pricePerNight: 299,
      currentStatus: 'MAINTENANCE',
      description: 'Our finest accommodation with exclusive amenities and personalized concierge service.',
      amenities: ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Bathtub', 'Room Service'],
      maxOccupancy: 4,
      availability: false,
      roomSize: 400,
      viewType: 'OCEAN',
      images: []
    }
  ];

  get filteredRooms() {
    return this.rooms.filter(room => {
      // Filter by type
      if (this.searchFilters.type !== 'ALL' && room.roomType !== this.searchFilters.type) {
        return false;
      }
      // Filter by guest capacity
      if (room.maxOccupancy < this.searchFilters.guests) {
        return false;
      }
      return true;
    });
  }

  handleSearch() {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }
}
