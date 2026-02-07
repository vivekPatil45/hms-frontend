import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

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
            <h2 class="text-xl font-semibold text-foreground">{{ profileForm.get('name')?.value }}</h2>
            <p class="text-sm text-muted-foreground">{{ profileForm.get('email')?.value }}</p>
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
                  formControlName="name"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                @if (profileForm.get('name')?.touched && profileForm.get('name')?.errors?.['required']) {
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
                <p class="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <!-- Phone -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Phone Number</label>
                <input
                  type="tel"
                  formControlName="phone"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                @if (profileForm.get('phone')?.touched && profileForm.get('phone')?.errors?.['required']) {
                  <p class="text-sm text-destructive">Phone number is required</p>
                }
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
              <p class="font-medium text-foreground">Password</p>
              <p class="text-sm text-muted-foreground">Last changed 3 months ago</p>
            </div>
            <app-button variant="outline" size="sm">Change Password</app-button>
          </div>
       </div>
    </div>
  `,
    styles: []
})
export class CustomerProfileComponent {
    profileForm: FormGroup;
    isLoading = false;

    constructor(private fb: FormBuilder) {
        this.profileForm = this.fb.group({
            name: ['John Doe', Validators.required],
            email: ['john.doe@example.com', [Validators.required, Validators.email]],
            phone: ['+1 (555) 123-4567', Validators.required],
            address: ['123 Luxury Ave, Suite 100, Beverly Hills, CA 90210']
        });
    }

    getInitials(): string {
        const name = this.profileForm.get('name')?.value || '';
        return name
            .split(' ')
            .map((n: string) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }

    onSubmit() {
        if (this.profileForm.valid) {
            this.isLoading = true;
            setTimeout(() => {
                this.isLoading = false;
                this.profileForm.markAsPristine();
                // Show success toast
            }, 1000);
        }
    }
}
