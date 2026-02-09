import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CustomerService } from '../../../core/services/customer.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../models/user.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 class="text-3xl font-bold text-foreground">My Profile</h1>
        <p class="text-muted-foreground mt-1">
          Manage your personal information and preferences
        </p>
      </div>

      <div class="bg-card rounded-xl border border-border overflow-hidden">
        <!-- Profile Header -->
        <div class="bg-muted/30 p-6 border-b border-border flex items-center gap-4">
          <div class="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {{ getInitials() }}
          </div>
          <div>
            <h2 class="text-xl font-semibold text-foreground">{{ profileForm.get('fullName')?.value }}</h2>
            <p class="text-sm text-muted-foreground">{{ profileForm.get('email')?.value || user?.username }}</p>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-2">
              Customer
            </span>
          </div>
        </div>

        <!-- Profile Form -->
        <div class="p-6">
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Name -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Full Name</label>
                <input
                  type="text"
                  formControlName="fullName"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                @if (profileForm.get('fullName')?.touched && profileForm.get('fullName')?.errors?.['required']) {
                  <p class="text-sm text-destructive">Name is required</p>
                }
              </div>

              <!-- Email -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  formControlName="email"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  readonly
                />
                <p class="text-xs text-muted-foreground">Email cannot be changed directly</p>
              </div>

              <!-- Phone -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Mobile Number</label>
                <input
                  type="tel"
                  formControlName="mobileNumber"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <!-- Address -->
              <div class="space-y-2 md:col-span-2">
                <label class="text-sm font-medium text-foreground">Address</label>
                <textarea
                  formControlName="address"
                  rows="3"
                  class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                ></textarea>
              </div>
            </div>
            
            @if (message) {
                <div [class]="'p-3 rounded-md text-sm ' + (isError ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700')">
                    {{ message }}
                </div>
            }

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

       <!-- Security Section -->
       <div class="bg-card rounded-xl border border-border overflow-hidden mt-6 p-6">
          <h3 class="text-lg font-semibold text-foreground mb-4">Security</h3>
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-foreground">Logout</p>
              <p class="text-sm text-muted-foreground"> securely log out of the system</p>
            </div>
            <app-button variant="destructive" size="sm" (click)="logout()">Logout</app-button>
          </div>
       </div>
    </div>
  `,
  styles: []
})
export class CustomerProfileComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = false;
  user: User | null = null;
  message: string = '';
  isError: boolean = false;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      mobileNumber: [''],
      address: ['']
    });
  }

  ngOnInit() {
    this.isLoading = true;
    this.authService.currentUser$.pipe(
      switchMap(user => {
        if (user) {
          this.user = user;
          // Prefer fetching fresh profile data from API
          return this.customerService.getProfile(user.userId).pipe(
            switchMap(apiResponse => {
              if (apiResponse.success && apiResponse.data) {
                return of({ success: true, data: apiResponse.data });
              }
              return of({ success: true, data: user }); // Fallback to session user
            }),
            // Catch error in fetching profile and fall back to session user
            switchMap(res => of(res))
          );
        }
        return of(null);
      })
    ).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response && response.data) {
          const userData = response.data;
          this.user = userData; // Update local user ref

          this.profileForm.patchValue({
            fullName: userData.fullName,
            email: userData.email,
            mobileNumber: userData.mobileNumber || '',
            address: userData.address || ''
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching profile', err);
        // Even if fetch fails, we might have user from session
        if (this.user) {
          this.profileForm.patchValue({
            fullName: this.user.fullName,
            email: this.user.email
          });
        }
      }
    });
  }

  getInitials(): string {
    const name = this.profileForm.get('fullName')?.value || this.user?.fullName || '';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  onSubmit() {
    if (this.profileForm.valid && this.user) {
      this.isLoading = true;
      this.message = '';
      this.isError = false;

      const updateData: Partial<User> = {
        fullName: this.profileForm.get('fullName')?.value,
        mobileNumber: this.profileForm.get('mobileNumber')?.value,
        address: this.profileForm.get('address')?.value
      };

      this.customerService.updateProfile(this.user.userId, updateData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.message = 'Profile updated successfully!';
          this.profileForm.markAsPristine();

          // Update auth service with new data to keep session in sync
          if (response.data) {
            this.authService.updateSession(response.data);
            this.user = { ...this.user!, ...response.data };
          } else {
            // Fallback if backend doesn't return full object
            this.authService.updateSession(updateData);
            this.user = { ...this.user!, ...updateData };
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.message = err.error?.message || 'Failed to update profile.';
          this.isError = true;
          console.error('Profile update error', err);
        }
      });
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      window.location.href = '/auth/login';
    });
  }
}
