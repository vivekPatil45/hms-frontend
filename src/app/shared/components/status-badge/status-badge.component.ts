import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../utils/cn.util';

type BadgeStatus =
    | 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED'  // Room statuses
    | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'    // Reservation statuses
    | 'PAID' | 'UNPAID'                                       // Bill statuses
    | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';        // Complaint statuses

@Component({
    selector: 'app-status-badge',
    standalone: true,
    imports: [CommonModule],
    template: `
    <span [class]="getBadgeClasses()">
      {{ getStatusText() }}
    </span>
  `,
    styles: []
})
export class StatusBadgeComponent {
    @Input() status!: BadgeStatus;
    @Input() className = '';

    getBadgeClasses(): string {
        const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';

        const statusClasses: Record<BadgeStatus, string> = {
            // Room statuses
            'AVAILABLE': 'badge-confirmed',
            'OCCUPIED': 'badge-booked',
            'MAINTENANCE': 'badge-pending',
            'RESERVED': 'badge-booked',

            // Reservation statuses
            'PENDING': 'badge-pending',
            'CONFIRMED': 'badge-confirmed',
            'CANCELLED': 'badge-cancelled',
            'COMPLETED': 'badge-closed',

            // Bill statuses
            'PAID': 'badge-paid',
            'UNPAID': 'badge-pending',

            // Complaint statuses
            'OPEN': 'badge-open',
            'IN_PROGRESS': 'badge-in-progress',
            'RESOLVED': 'badge-confirmed',
            'CLOSED': 'badge-closed',
        };

        return cn(
            baseClasses,
            statusClasses[this.status] || 'badge-open',
            this.className
        );
    }

    getStatusText(): string {
        return this.status.replace(/_/g, ' ');
    }
}
