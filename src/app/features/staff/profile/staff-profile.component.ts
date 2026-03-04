import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-staff-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonComponent, LoadingSpinnerComponent],
    template: `
    <div class="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 class="text-3xl font-bold text-foreground">My Profile</h1>
        <p class="text-muted-foreground mt-1">Manage your staff account details</p>
      </div>

      <div class="bg-card rounded-xl border border-border overflow-hidden">
        <!-- Profile Header -->
        <div class="bg-muted/30 p-6 border-b border-border flex items-center gap-4">
          <div class="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {{ getInitials() }}
          </div>
          <div>
            <h2 class="text-xl font-semibold text-foreground">{{ profileForm.get('fullName')?.value || user?.fullName }}</h2>
            <p class="text-sm text-muted-foreground">{{ user?.email }}</p>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-2">
              Staff
            </span>
          </div>
        </div>

        <!-- Form -->
        <div class="p-6">
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

              <!-- Full Name -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Full Name</label>
                <input type="text" formControlName="fullName"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                @if (profileForm.get('fullName')?.touched && profileForm.get('fullName')?.errors?.['required']) {
                  <p class="text-sm text-destructive">Name is required</p>
                }
              </div>

              <!-- Username (disabled) -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Username</label>
                <input type="text" formControlName="username"
                  class="flex h-10 w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                  [attr.disabled]="true"
                />
              </div>

              <!-- Email (disabled) -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Email</label>
                <input type="email" formControlName="email"
                  class="flex h-10 w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                  [attr.disabled]="true"
                />
              </div>

              <!-- Mobile Number -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Mobile Number</label>
                <div class="flex gap-2">
                  <select formControlName="countryCode"
                    class="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+971">+971 (UAE)</option>
                    <option value="+65">+65 (SG)</option>
                  </select>
                  <input type="tel" formControlName="mobileNumber" placeholder="9876543210"
                    class="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    [class.border-destructive]="profileForm.get('mobileNumber')?.touched && profileForm.get('mobileNumber')?.invalid"
                  />
                </div>
                @if (profileForm.get('mobileNumber')?.touched && profileForm.get('mobileNumber')?.errors?.['pattern']) {
                  <p class="text-sm text-destructive">Enter a valid mobile number (8–12 digits)</p>
                }
              </div>

              <!-- Address -->
              <div class="space-y-2 md:col-span-2">
                <label class="text-sm font-medium text-foreground">Address</label>
                <textarea formControlName="address" rows="3"
                  class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end pt-4 border-t border-border">
              <app-button type="submit" [disabled]="profileForm.invalid || isLoading || !profileForm.dirty">
                @if (isLoading) {
                  <app-loading-spinner size="sm" class="mr-2"></app-loading-spinner>
                  Saving...
                } @else {
                  Save Changes
                }
              </app-button>
            </div>
          </form>
        </div>
      </div>

      <!-- Security -->
      <div class="bg-card rounded-xl border border-border overflow-hidden mt-6 p-6">
        <h3 class="text-lg font-semibold text-foreground mb-4">Security</h3>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-foreground">Logout</p>
            <p class="text-sm text-muted-foreground">Securely log out of the system</p>
          </div>
          <app-button variant="destructive" size="sm" (click)="logout()">Logout</app-button>
        </div>
      </div>
    </div>
  `
})
export class StaffProfileComponent implements OnInit {
    profileForm: FormGroup;
    isLoading = false;
    user: User | null = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private toastService: ToastService
    ) {
        this.profileForm = this.fb.group({
            fullName: ['', Validators.required],
            username: [{ value: '', disabled: true }],
            email: [{ value: '', disabled: true }],
            countryCode: ['+91'],
            mobileNumber: ['', [Validators.pattern('^[0-9]{8,12}$')]],
            address: ['']
        });
    }

    ngOnInit() {
        this.authService.currentUser$.subscribe(user => {
            if (user) {
                this.user = user;

                let countryCode = '+91';
                let mobileNumber = user.mobileNumber || '';
                if (mobileNumber.includes('-')) {
                    const parts = mobileNumber.split('-');
                    countryCode = parts[0];
                    mobileNumber = parts[1] || '';
                }

                this.profileForm.patchValue({
                    fullName: user.fullName,
                    username: user.username || '',
                    email: user.email,
                    countryCode,
                    mobileNumber,
                    address: (user as any).address || ''
                });
            }
        });
    }

    getInitials(): string {
        const name = this.profileForm.get('fullName')?.value || this.user?.fullName || '';
        return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
    }

    onSubmit() {
        if (this.profileForm.valid && this.user) {
            this.isLoading = true;
            const countryCode = this.profileForm.get('countryCode')?.value || '+91';
            const mobileNumber = this.profileForm.get('mobileNumber')?.value || '';

            const updateData = {
                fullName: this.profileForm.get('fullName')?.value,
                mobileNumber: mobileNumber ? `${countryCode}-${mobileNumber}` : '',
                address: this.profileForm.get('address')?.value
            };

            this.authService.updateSession(updateData);
            this.toastService.success('Profile updated successfully!');
            this.profileForm.markAsPristine();
            this.isLoading = false;
        }
    }

    logout() {
        this.authService.logout().subscribe(() => {
            window.location.href = '/auth/login';
        });
    }
}
