import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Complaint } from '../../../models/complaint.model';

@Component({
  selector: 'app-staff-complaints',
  standalone: true,
  imports: [CommonModule, ButtonComponent, StatusBadgeComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div>
        <h1 class="text-3xl font-bold text-foreground">My Assigned Complaints</h1>
        <p class="text-muted-foreground mt-1">
          Manage and resolve customer complaints assigned to you
        </p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-card rounded-xl border border-border p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Open</p>
              <p class="text-2xl font-bold text-foreground">{{ getCountByStatus('OPEN') }}</p>
            </div>
            <div class="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
              <svg class="h-6 w-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-card rounded-xl border border-border p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">In Progress</p>
              <p class="text-2xl font-bold text-foreground">{{ getCountByStatus('IN_PROGRESS') }}</p>
            </div>
            <div class="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
              <svg class="h-6 w-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-card rounded-xl border border-border p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Resolved Today</p>
              <p class="text-2xl font-bold text-foreground">{{ getCountByStatus('RESOLVED') }}</p>
            </div>
            <div class="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <svg class="h-6 w-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Complaints List -->
      <div class="space-y-4">
        @for (complaint of complaints; track complaint.id) {
          <div class="bg-card rounded-xl border border-border p-6 card-hover">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="font-semibold text-lg text-foreground">{{ complaint.title }}</h3>
                  <app-status-badge [status]="complaint.status"></app-status-badge>
                  <span [class]="getPriorityClass(complaint.priority)">
                    {{ complaint.priority }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground mb-3">
                  {{ complaint.description }}
                </p>
                <div class="flex items-center gap-4 text-sm text-muted-foreground">
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Customer #{{ complaint.customerId }}
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {{ complaint.category }}
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ complaint.createdAt | date:'medium' }}
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                @if (complaint.status === 'OPEN') {
                  <app-button size="sm">
                    Start Working
                  </app-button>
                }
                @if (complaint.status === 'IN_PROGRESS') {
                  <app-button variant="default" size="sm">
                    Mark Resolved
                  </app-button>
                }
                <app-button variant="ghost" size="sm">
                  Details
                </app-button>
              </div>
            </div>
          </div>
        }
      </div>

      @if (complaints.length === 0) {
        <div class="p-12 text-center border border-dashed border-border rounded-xl">
          <svg class="h-12 w-12 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-medium text-foreground">All caught up!</h3>
          <p class="text-muted-foreground mt-1">
            No complaints assigned to you at the moment.
          </p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class StaffComplaintsComponent {
  complaints: Complaint[] = [
    {
      id: 1,
      customerId: 1,
      title: 'AC not cooling',
      description: 'The air conditioner in room 101 is not cooling properly even at lowest setting. Customer has requested immediate attention.',
      category: 'Maintenance',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      createdAt: '2024-03-16T10:30:00Z',
      assignedToId: 1
    },
    {
      id: 4,
      customerId: 4,
      title: 'Broken TV remote',
      description: 'TV remote control is not working. Batteries have been replaced but issue persists.',
      category: 'Maintenance',
      priority: 'LOW',
      status: 'OPEN',
      createdAt: '2024-03-17T14:20:00Z',
      assignedToId: 1
    },
    {
      id: 5,
      customerId: 5,
      title: 'WiFi connectivity issues',
      description: 'Internet connection keeps dropping every few minutes. Unable to work remotely.',
      category: 'Technical',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      createdAt: '2024-03-17T08:00:00Z',
      assignedToId: 1
    }
  ];

  getCountByStatus(status: string): number {
    return this.complaints.filter(c => c.status === status).length;
  }

  getPriorityClass(priority: string): string {
    const classes = {
      'LOW': 'bg-info/10 text-info',
      'MEDIUM': 'bg-warning/10 text-warning',
      'HIGH': 'bg-destructive/10 text-destructive',
      'URGENT': 'bg-destructive/20 text-destructive font-bold'
    };
    return `text-xs font-medium px-2 py-1 rounded ${classes[priority as keyof typeof classes] || 'bg-muted text-muted-foreground'}`;
  }
}
