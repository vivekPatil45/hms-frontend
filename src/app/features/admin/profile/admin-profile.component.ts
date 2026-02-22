import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-admin-profile',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Admin Profile</h1>
        <p class="text-muted-foreground mt-1">
          Manage your administrator account details.
        </p>
      </div>

      <div class="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div class="flex items-center gap-6 mb-8 pb-8 border-b border-border">
          <div class="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {{ user?.fullName?.charAt(0) || 'A' }}
          </div>
          <div>
            <h2 class="text-2xl font-bold text-foreground">{{ user?.fullName || 'Administrator' }}</h2>
            <p class="text-muted-foreground">{{ user?.email }}</p>
            <span class="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {{ user?.role || 'ADMIN' }}
            </span>
          </div>
        </div>

        <div class="space-y-4">
            <h3 class="font-semibold text-lg">Account Details</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span class="text-muted-foreground block mb-1">Username</span>
                    <span class="font-medium text-foreground">{{ user?.username }}</span>
                </div>
                <div>
                    <span class="text-muted-foreground block mb-1">Mobile Number</span>
                    <span class="font-medium text-foreground">{{ user?.mobileNumber || 'N/A' }}</span>
                </div>
                <div>
                    <span class="text-muted-foreground block mb-1">Account Status</span>
                    <span class="font-medium text-success">Active</span>
                </div>
            </div>
            
            <div class="mt-8 pt-6 border-t border-border flex justify-end gap-3">
                <button class="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
                    Edit Profile
                </button>
            </div>
        </div>
      </div>
    </div>
  `
})
export class AdminProfileComponent implements OnInit {
    user: any = null;

    constructor(private authService: AuthService) { }

    ngOnInit() {
        this.authService.currentUser$.subscribe(user => {
            if (user) {
                this.user = user;
            }
        });
    }
}
