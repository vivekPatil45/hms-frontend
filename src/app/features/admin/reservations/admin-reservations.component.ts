import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Reservation } from '../../../models/reservation.model';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    StatusBadgeComponent
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Reservations</h1>
          <p class="text-muted-foreground mt-1">
            Manage all hotel reservations
          </p>
        </div>
        <div class="flex gap-2">
          <app-button variant="outline" size="sm">
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </app-button>
          <app-button>
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Reservation
          </app-button>
        </div>
      </div>

      <div class="bg-card rounded-xl border border-border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-muted/50 border-b border-border">
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">ID</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Customer</th>
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
              @for (reservation of reservations; track reservation.reservationId) {
                <tr class="hover:bg-muted/50 transition-colors">
                  <td class="py-3 px-4 font-medium text-foreground">#{{ reservation.reservationId }}</td>
                  <td class="py-3 px-4 text-sm text-foreground">Customer {{ reservation.customer?.customerId }}</td>
                  <td class="py-3 px-4 text-sm text-foreground">
                    {{ reservation.room?.roomType }} - {{ reservation.room?.roomNumber }}
                  </td>
                  <td class="py-3 px-4 text-sm text-foreground">
                    {{ reservation.checkInDate | date:'shortDate' }}
                  </td>
                  <td class="py-3 px-4 text-sm text-foreground">
                    {{ reservation.checkOutDate | date:'shortDate' }}
                  </td>
                  <td class="py-3 px-4 text-sm text-foreground">{{ reservation.numberOfAdults + reservation.numberOfChildren }}</td>
                  <td class="py-3 px-4 text-sm font-medium text-foreground">\${{ reservation.totalAmount }}</td>
                  <td class="py-3 px-4">
                    <app-status-badge [status]="reservation.status"></app-status-badge>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <app-button variant="ghost" size="sm" class="mr-2">
                      View
                    </app-button>
                    @if (reservation.status === 'PENDING') {
                      <app-button variant="outline" size="sm" class="mr-2">
                        Confirm
                      </app-button>
                    }
                    <app-button variant="destructive" size="sm">
                      Cancel
                    </app-button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminReservationsComponent {
  reservations: Reservation[] = [
    {
      reservationId: 'RES001',
      customer: { customerId: 'C001' },
      roomId: '1',
      room: {
        roomId: '1',
        roomNumber: '101',
        roomType: 'DELUXE',
        bedType: 'DOUBLE',
        floor: 1,
        pricePerNight: 250,
        availability: true,
        maxOccupancy: 2,
        roomSize: 300,
        viewType: 'CITY',
        amenities: [],
        images: [],
        createdAt: '',
        updatedAt: ''
      },
      checkInDate: '2024-03-15',
      checkOutDate: '2024-03-18',
      numberOfAdults: 2,
      numberOfChildren: 0,
      numberOfNights: 3,
      baseAmount: 750,
      taxAmount: 0,
      totalAmount: 750,
      status: 'CONFIRMED',
      paymentStatus: 'PAID'
    },
    {
      reservationId: 'RES002',
      customer: { customerId: 'C002' },
      roomId: '2',
      room: {
        roomId: '2',
        roomNumber: '205',
        roomType: 'SUITE',
        bedType: 'KING',
        floor: 2,
        pricePerNight: 450,
        availability: true,
        maxOccupancy: 3,
        roomSize: 500,
        viewType: 'CITY',
        amenities: [],
        images: [],
        createdAt: '',
        updatedAt: ''
      },
      checkInDate: '2024-04-20',
      checkOutDate: '2024-04-22',
      numberOfAdults: 3,
      numberOfChildren: 0,
      numberOfNights: 2,
      baseAmount: 900,
      taxAmount: 0,
      totalAmount: 900,
      status: 'PENDING',
      paymentStatus: 'UNPAID'
    }
  ];
}
