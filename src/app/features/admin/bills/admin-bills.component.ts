import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Bill } from '../../../models/bill.model';

@Component({
  selector: 'app-admin-bills',
  standalone: true,
  imports: [CommonModule, ButtonComponent, StatusBadgeComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Bills & Payments</h1>
          <p class="text-muted-foreground mt-1">
            Manage billing and payment transactions
          </p>
        </div>
        <app-button>
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Generate Bill
        </app-button>
      </div>

      <div class="bg-card rounded-xl border border-border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-muted/50 border-b border-border">
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Bill ID</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Reservation</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Customer</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Amount</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Payment Method</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Date</th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Status</th>
                <th class="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (bill of bills; track bill.id) {
                <tr class="hover:bg-muted/50 transition-colors">
                  <td class="py-3 px-4 font-medium text-foreground">#{{ bill.id }}</td>
                  <td class="py-3 px-4 text-sm text-foreground">RES-{{ bill.reservationId }}</td>
                  <td class="py-3 px-4 text-sm text-foreground">Customer {{ bill.customerId }}</td>
                  <td class="py-3 px-4 text-sm font-medium text-foreground">\${{ bill.totalAmount }}</td>
                  <td class="py-3 px-4 text-sm text-foreground">{{ bill.paymentMethod || 'N/A' }}</td>
                  <td class="py-3 px-4 text-sm text-foreground">
                    {{ bill.createdAt | date:'shortDate' }}
                  </td>
                  <td class="py-3 px-4">
                    <app-status-badge [status]="bill.status === 'PAID' ? 'PAID' : 'UNPAID'"></app-status-badge>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <app-button variant="ghost" size="sm" class="mr-2">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </app-button>
                    @if (bill.status === 'PENDING') {
                      <app-button variant="outline" size="sm">
                        Mark Paid
                      </app-button>
                    }
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
export class AdminBillsComponent {
  bills: Bill[] = [
    {
      id: 1,
      reservationId: 1,
      customerId: 1,
      amount: 675,
      tax: 75,
      discount: 0,
      totalAmount: 750,
      status: 'PAID',
      paymentMethod: 'CARD',
      createdAt: '2024-03-18T10:00:00Z'
    },
    {
      id: 2,
      reservationId: 2,
      customerId: 2,
      amount: 860,
      tax: 90,
      discount: 50,
      totalAmount: 900,
      status: 'PENDING',
      createdAt: '2024-04-20T14:30:00Z'
    }
  ];
}
