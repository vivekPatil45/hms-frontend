import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, StatsCardComponent],
    template: `
    <div class="space-y-6 animate-fade-in">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Dashboard</h1>
        <p class="text-muted-foreground mt-1">
          Overview of hotel performance and key metrics
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stats-card
          title="Total Revenue"
          value="$45,231.89"
          icon="$"
          [change]="20.1"
          description="from last month"
        ></app-stats-card>
        <app-stats-card
          title="Bookings"
          value="+2350"
          icon="#"
          [change]="180.1"
          description="from last month"
        ></app-stats-card>
        <app-stats-card
          title="Active Now"
          value="+573"
          icon="A"
          [change]="19"
          description="since last hour"
        ></app-stats-card>
        <app-stats-card
          title="Complaints"
          value="12"
          icon="!"
          [change]="-4"
          description="active complaints"
        ></app-stats-card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Bookings -->
        <div class="bg-card rounded-xl border border-border p-6">
          <h3 class="font-semibold text-lg mb-4">Recent Bookings</h3>
          <div class="space-y-4">
            @for (booking of recentBookings; track booking.id) {
              <div class="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div class="flex items-center gap-4">
                  <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {{ booking.guest[0] }}
                  </div>
                  <div>
                    <p class="font-medium text-foreground">{{ booking.guest }}</p>
                    <p class="text-sm text-muted-foreground">{{ booking.email }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-medium text-foreground">+\${{ booking.amount }}</p>
                  <p class="text-sm text-muted-foreground">{{ booking.date }}</p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Room Status -->
        <div class="bg-card rounded-xl border border-border p-6">
          <h3 class="font-semibold text-lg mb-4">Room Status</h3>
          <div class="space-y-4">
             <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="h-3 w-3 rounded-full bg-success"></div>
                    <span class="text-sm font-medium">Available</span>
                </div>
                <span class="text-sm text-muted-foreground">45 rooms</span>
             </div>
             <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="h-3 w-3 rounded-full bg-destructive"></div>
                    <span class="text-sm font-medium">Occupied</span>
                </div>
                <span class="text-sm text-muted-foreground">32 rooms</span>
             </div>
             <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="h-3 w-3 rounded-full bg-warning"></div>
                    <span class="text-sm font-medium">Maintenance</span>
                </div>
                <span class="text-sm text-muted-foreground">3 rooms</span>
             </div>
             <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="h-3 w-3 rounded-full bg-info"></div>
                    <span class="text-sm font-medium">Reserved</span>
                </div>
                <span class="text-sm text-muted-foreground">8 rooms</span>
             </div>

             <!-- Simple visual bar -->
             <div class="h-4 w-full bg-muted rounded-full overflow-hidden flex mt-2">
                <div class="h-full bg-success w-[51%]"></div>
                <div class="h-full bg-destructive w-[36%]"></div>
                <div class="h-full bg-warning w-[4%]"></div>
                <div class="h-full bg-info w-[9%]"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class AdminDashboardComponent {
    recentBookings = [
        { id: 1, guest: 'Alice Johnson', email: 'alice@example.com', amount: 450, date: 'Just now' },
        { id: 2, guest: 'Bob Smith', email: 'bob@example.com', amount: 250, date: '2 min ago' },
        { id: 3, guest: 'Charlie Brown', email: 'charlie@example.com', amount: 850, date: '15 min ago' },
        { id: 4, guest: 'Diana Prince', email: 'diana@example.com', amount: 150, date: '1 hour ago' }
    ];
}
