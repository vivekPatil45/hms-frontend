import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Complaint } from '../../../models/complaint.model';

@Component({
    selector: 'app-admin-complaints',
    standalone: true,
    imports: [CommonModule, ButtonComponent, StatusBadgeComponent],
    template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Complaints Management</h1>
          <p class="text-muted-foreground mt-1">
            Monitor and resolve customer complaints
          </p>
        </div>
        <div class="flex gap-2">
          <app-button variant="outline" size="sm">
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </app-button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (complaint of complaints; track complaint.id) {
          <div class="bg-card rounded-xl border border-border p-6 card-hover">
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-2">
                <app-status-badge [status]="complaint.status"></app-status-badge>
                <span [class]="getPriorityClass(complaint.priority)">
                  {{ complaint.priority }}
                </span>
              </div>
              <span class="text-xs text-muted-foreground">
                {{ complaint.createdAt | date:'shortDate' }}
              </span>
            </div>

            <h3 class="font-semibold text-lg text-foreground mb-2">{{ complaint.title }}</h3>
            <p class="text-sm text-muted-foreground mb-4 line-clamp-3">
              {{ complaint.description }}
            </p>

            <div class="space-y-2 mb-4">
              <div class="flex items-center gap-2 text-sm">
                <svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="text-muted-foreground">Customer #{{ complaint.customerId }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span class="text-muted-foreground">{{ complaint.category }}</span>
              </div>
            </div>

            <div class="flex gap-2">
              @if (complaint.status === 'OPEN') {
                <app-button variant="outline" size="sm" class="flex-1">
                  Assign
                </app-button>
              }
              @if (complaint.status === 'IN_PROGRESS') {
                <app-button variant="default" size="sm" class="flex-1">
                  Resolve
                </app-button>
              }
              <app-button variant="ghost" size="sm">
                View
              </app-button>
            </div>
          </div>
        }
      </div>

      @if (complaints.length === 0) {
        <div class="p-12 text-center border border-dashed border-border rounded-xl">
          <svg class="h-12 w-12 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="text-lg font-medium text-foreground">No complaints</h3>
          <p class="text-muted-foreground mt-1">
            All customer issues have been resolved.
          </p>
        </div>
      }
    </div>
  `,
    styles: []
})
export class AdminComplaintsComponent {
    complaints: Complaint[] = [
        {
            id: 1,
            customerId: 1,
            title: 'AC not cooling',
            description: 'The air conditioner in room 101 is not cooling properly even at lowest setting.',
            category: 'Maintenance',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            createdAt: '2024-03-16T10:30:00Z'
        },
        {
            id: 2,
            customerId: 2,
            title: 'Noisy neighbors',
            description: 'Guests in the adjacent room are playing loud music late at night.',
            category: 'Noise',
            priority: 'MEDIUM',
            status: 'OPEN',
            createdAt: '2024-03-15T23:15:00Z'
        },
        {
            id: 3,
            customerId: 3,
            title: 'Room service delay',
            description: 'Ordered breakfast at 8 AM, still not received by 9:30 AM.',
            category: 'Service',
            priority: 'URGENT',
            status: 'RESOLVED',
            createdAt: '2024-03-14T09:30:00Z'
        }
    ];

    getPriorityClass(priority: string): string {
        const classes = {
            'LOW': 'text-info',
            'MEDIUM': 'text-warning',
            'HIGH': 'text-destructive',
            'URGENT': 'text-destructive font-bold'
        };
        return `text-xs font-bold px-2 py-1 rounded ${classes[priority as keyof typeof classes] || 'text-muted-foreground'}`;
    }
}
