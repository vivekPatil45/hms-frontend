import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Room } from '../../../models/room.model';
import { ROOM_AMENITIES } from '../../../shared/utils/constants';

@Component({
    selector: 'app-admin-rooms',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonComponent,
        StatusBadgeComponent,
        ModalComponent
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
        <app-button (click)="openAddRoomModal()">
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Room
        </app-button>
      </div>

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
              @for (room of rooms; track room.id) {
                <tr class="hover:bg-muted/50 transition-colors">
                  <td class="py-3 px-4 font-medium text-foreground">{{ room.number }}</td>
                  <td class="py-3 px-4 text-sm text-foreground">{{ room.type }}</td>
                  <td class="py-3 px-4 text-sm text-foreground">{{ room.floor }}</td>
                  <td class="py-3 px-4 text-sm text-foreground">{{ room.capacity }}</td>
                  <td class="py-3 px-4 text-sm font-medium text-foreground">\${{ room.pricePerNight }}</td>
                  <td class="py-3 px-4">
                    <app-status-badge [status]="room.status"></app-status-badge>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <app-button variant="ghost" size="sm" class="mr-2">
                      Edit
                    </app-button>
                    <app-button variant="destructive" size="sm">
                      Delete
                    </app-button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Room Modal -->
    <app-modal
      [isOpen]="isModalOpen"
      title="Add New Room"
      size="lg"
      (close)="closeModal()"
    >
      <form [formGroup]="roomForm" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Room Number</label>
            <input
              type="text"
              formControlName="number"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="101"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Type</label>
            <select
              formControlName="type"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="STANDARD">Standard</option>
              <option value="DELUXE">Deluxe</option>
              <option value="SUITE">Suite</option>
              <option value="PRESIDENTIAL">Presidential</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Floor</label>
            <input
              type="number"
              formControlName="floor"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Capacity</label>
            <input
              type="number"
              formControlName="capacity"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Price per Night</label>
            <input
              type="number"
              formControlName="pricePerNight"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Status</label>
            <select
              formControlName="status"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="RESERVED">Reserved</option>
            </select>
          </div>

          <div class="space-y-2 col-span-2">
            <label class="text-sm font-medium text-foreground">Description</label>
            <textarea
              formControlName="description"
              rows="3"
              class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            ></textarea>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3" footer>
          <app-button variant="ghost" (click)="closeModal()" type="button">
            Cancel
          </app-button>
          <app-button type="submit" [disabled]="roomForm.invalid">
            Add Room
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
    styles: []
})
export class AdminRoomsComponent {
    rooms: Room[] = [
        {
            id: 1,
            number: '101',
            type: 'DELUXE',
            floor: 1,
            pricePerNight: 250,
            status: 'AVAILABLE',
            description: 'Spacious deluxe room',
            amenities: ['WiFi', 'AC', 'TV'],
            capacity: 2
        },
        {
            id: 2,
            number: '205',
            type: 'SUITE',
            floor: 2,
            pricePerNight: 450,
            status: 'OCCUPIED',
            description: 'Luxurious suite',
            amenities: ['WiFi', 'AC', 'TV', 'Mini Bar'],
            capacity: 3
        }
    ];

    isModalOpen = false;
    roomForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.roomForm = this.fb.group({
            number: ['', Validators.required],
            type: ['STANDARD', Validators.required],
            floor: [1, Validators.required],
            capacity: [2, Validators.required],
            pricePerNight: [150, Validators.required],
            status: ['AVAILABLE', Validators.required],
            description: ['']
        });
    }

    openAddRoomModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
        this.roomForm.reset();
    }

    onSubmit() {
        if (this.roomForm.valid) {
            console.log('Room added:', this.roomForm.value);
            this.closeModal();
        }
    }
}
