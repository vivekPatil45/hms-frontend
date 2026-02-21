import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, StatsCardComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Welcome, {{ adminName }}!</h1>
        <p class="text-muted-foreground mt-1">
          Overview of hotel performance and key metrics
        </p>
      </div>

      <div *ngIf="isLoading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <!-- Stats Grid -->
      <div *ngIf="!isLoading && stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stats-card
          title="Total Revenue"
          [value]="'$' + (stats?.totalRevenue | number:'1.2-2')"
          icon="$"
          [change]="12.5"
          description="vs last month"
        ></app-stats-card>
        <app-stats-card
          title="Total Bookings"
          [value]="stats?.totalBookings?.toString()"
          icon="#"
          [change]="5.2"
          description="vs last month"
        ></app-stats-card>
        <app-stats-card
          title="Check-ins Today"
          [value]="stats?.todayCheckIns?.toString()"
          icon="A"
          [change]="2"
          description="since yesterday"
        ></app-stats-card>
        <app-stats-card
          title="Open Complaints"
          [value]="stats?.openComplaints?.toString()"
          icon="!"
          [change]="-1"
          description="active issues to resolve"
        ></app-stats-card>
      </div>

      <div *ngIf="!isLoading && stats" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <!-- Dashboard Summary Detail -->
        <div class="bg-card rounded-xl border border-border p-6 flex flex-col justify-center">
          <h3 class="font-semibold text-lg mb-4 text-center">Daily Activity Overview</h3>
          <div class="flex justify-around items-center">
            <div class="text-center p-4">
              <span class="block text-4xl font-bold text-success">{{ stats?.todayCheckIns }}</span>
              <span class="text-sm text-muted-foreground mt-2 block">Check-ins</span>
            </div>
            <div class="h-16 w-px bg-border"></div>
            <div class="text-center p-4">
              <span class="block text-4xl font-bold text-warning">{{ stats?.todayCheckOuts }}</span>
              <span class="text-sm text-muted-foreground mt-2 block">Check-outs</span>
            </div>
          </div>
        </div>

        <!-- Recent Bookings -->
        <div class="bg-card rounded-xl border border-border p-6">
          <h3 class="font-semibold text-lg mb-4">Recent Bookings</h3>
          <div class="space-y-4">
            <ng-container *ngIf="stats?.recentBookings?.length; else noBookings">
              @for (booking of stats.recentBookings; track booking.id) {
                <div class="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div class="flex items-center gap-4">
                    <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {{ booking.guest ? booking.guest[0] : 'U' | uppercase }}
                    </div>
                    <div>
                      <p class="font-medium text-foreground">{{ booking.guest || 'Unknown Guest' }}</p>
                      <p class="text-sm text-muted-foreground">{{ booking.email }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-foreground">+\${{ booking.amount | number:'1.2-2' }}</p>
                    <p class="text-sm text-muted-foreground">{{ booking.date | date:'MMM d, h:mm a' }}</p>
                  </div>
                </div>
              }
            </ng-container>
            <ng-template #noBookings>
              <p class="text-sm text-muted-foreground text-center py-4">No recent bookings found.</p>
            </ng-template>
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
                <span class="text-sm text-muted-foreground">{{ stats?.availableRooms }} rooms</span>
             </div>
             <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="h-3 w-3 rounded-full bg-destructive"></div>
                    <span class="text-sm font-medium">Occupied</span>
                </div>
                <span class="text-sm text-muted-foreground">{{ stats?.totalRooms - stats?.availableRooms }} rooms</span>
             </div>
             
             <!-- Simple visual bar -->
             <div class="h-4 w-full bg-muted rounded-full overflow-hidden flex mt-2">
                <div class="h-full bg-success" [style.width.%]="(stats?.availableRooms / stats?.totalRooms) * 100"></div>
                <div class="h-full bg-destructive" [style.width.%]="((stats?.totalRooms - stats?.availableRooms) / stats?.totalRooms) * 100"></div>
             </div>
             <div class="text-xs text-muted-foreground text-center mt-2">Total Rooms: {{ stats?.totalRooms }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  stats: any = null;
  isLoading = true;
  adminName = 'Admin';

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user && user.fullName) {
        this.adminName = user.fullName;
      }
    });

    this.loadDashboardStats();
  }

  loadDashboardStats() {
    this.isLoading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard stats', err);
        this.isLoading = false;
      }
    });
  }
}
