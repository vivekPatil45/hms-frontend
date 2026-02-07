import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-admin-customers',
    standalone: true,
    imports: [CommonModule, ButtonComponent],
    template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Customers</h1>
          <p class="text-muted-foreground mt-1">
            Manage customer accounts and information
          </p>
        </div>
        <div class="flex gap-2">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search customers..."
              class="h-9 w-64 pl-9 pr-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (customer of customers; track customer.id) {
          <div class="bg-card rounded-xl border border-border p-6 card-hover">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {{ getInitials(customer.name) }}
                </div>
                <div>
                  <h3 class="font-semibold text-foreground">{{ customer.name }}</h3>
                  <p class="text-sm text-muted-foreground">{{ customer.email }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2 text-muted-foreground">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {{ customer.phone }}
              </div>
              <div class="flex items-center gap-2 text-muted-foreground">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Joined {{ customer.createdAt | date:'mediumDate' }}
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-border flex gap-2">
              <app-button variant="outline" size="sm" class="flex-1">
                View Details
              </app-button>
              <app-button variant="ghost" size="sm">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </app-button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
    styles: []
})
export class AdminCustomersComponent {
    customers: User[] = [
        {
            id: 1,
            name: 'Alice Johnson',
            email: 'alice@example.com',
            phone: '+1 (555) 123-4567',
            role: 'CUSTOMER',
            createdAt: '2024-01-15T10:00:00Z'
        },
        {
            id: 2,
            name: 'Bob Smith',
            email: 'bob@example.com',
            phone: '+1 (555) 234-5678',
            role: 'CUSTOMER',
            createdAt: '2024-02-20T14:30:00Z'
        },
        {
            id: 3,
            name: 'Charlie Brown',
            email: 'charlie@example.com',
            phone: '+1 (555) 345-6789',
            role: 'CUSTOMER',
            createdAt: '2024-03-10T09:15:00Z'
        }
    ];

    getInitials(name: string): string {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }
}
