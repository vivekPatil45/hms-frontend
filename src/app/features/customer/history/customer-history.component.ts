import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Reservation } from '../../../models/reservation.model';

@Component({
    selector: 'app-customer-history',
    standalone: true,
    imports: [
        CommonModule,
        ButtonComponent,
        StatusBadgeComponent
    ],
    template: `
    <div class="space-y-6 animate-fade-in">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Booking History</h1>
        <p class="text-muted-foreground mt-1">
          View your past and upcoming reservations
        </p>
      </div>

      <div class="bg-card rounded-xl border border-border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-muted/50 border-b border-border">
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Room</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Check In</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Check Out</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Guests</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Amount</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Status</th>
                <th class="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (booking of bookings; track booking.id) {
                <tr class="hover:bg-muted/50 transition-colors">
                  <td class="py-3 px-4">
                    <div class="font-medium text-foreground">{{ booking.room?.type }}</div>
                    <div class="text-xs text-muted-foreground">Room {{ booking.room?.number }}</div>
                  </td>
                  <td class="py-3 px-4 text-sm text-foreground">
                    {{ booking.checkInDate | date:'mediumDate' }}
                  </td>
                  <td class="py-3 px-4 text-sm text-foreground">
                    {{ booking.checkOutDate | date:'mediumDate' }}
                  </td>
                  <td class="py-3 px-4 text-sm text-foreground">
                    {{ booking.numberOfGuests }}
                  </td>
                  <td class="py-3 px-4 text-sm font-medium text-foreground">
                    \${{ booking.totalAmount }}
                  </td>
                  <td class="py-3 px-4">
                    <app-status-badge [status]="booking.status"></app-status-badge>
                  </td>
                  <td class="py-3 px-4 text-right">
                    @if (booking.status === 'PENDING' || booking.status === 'CONFIRMED') {
                      <app-button variant="destructive" size="sm" class="mr-2">
                        Cancel
                      </app-button>
                    }
                    <app-button variant="ghost" size="sm">
                      Details
                    </app-button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        
        @if (bookings.length === 0) {
          <div class="p-8 text-center text-muted-foreground">
            No bookings found.
          </div>
        }
      </div>
    </div>
  `,
    styles: []
})
export class CustomerHistoryComponent {
    bookings: Reservation[] = [
        {
            id: 1,
            customerId: 1,
            roomId: 1,
            room: {
                id: 1,
                number: '101',
                type: 'DELUXE',
                floor: 1,
                pricePerNight: 250,
                status: 'AVAILABLE',
                description: 'Deluxe Room',
                amenities: [],
                capacity: 2
            },
            checkInDate: '2024-03-15',
            checkOutDate: '2024-03-18',
            numberOfGuests: 2,
            totalAmount: 750,
            status: 'CONFIRMED'
        },
        {
            id: 2,
            customerId: 1,
            roomId: 2,
            room: {
                id: 2,
                number: '205',
                type: 'SUITE',
                floor: 2,
                pricePerNight: 450,
                status: 'OCCUPIED',
                description: 'Suite Room',
                amenities: [],
                capacity: 3
            },
            checkInDate: '2024-04-20',
            checkOutDate: '2024-04-22',
            numberOfGuests: 3,
            totalAmount: 900,
            status: 'PENDING'
        },
        {
            id: 3,
            customerId: 1,
            roomId: 4,
            room: {
                id: 4,
                number: '102',
                type: 'STANDARD',
                floor: 1,
                pricePerNight: 150,
                status: 'MAINTENANCE',
                description: 'Standard Room',
                amenities: [],
                capacity: 2
            },
            checkInDate: '2023-12-10',
            checkOutDate: '2023-12-12',
            numberOfGuests: 1,
            totalAmount: 300,
            status: 'COMPLETED'
        }
    ];
}
