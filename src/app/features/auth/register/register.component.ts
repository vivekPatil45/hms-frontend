import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        ButtonComponent,
        LoadingSpinnerComponent
    ],
    template: `
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-foreground">Create Account</h2>
        <p class="text-muted-foreground mt-2">Join us for an exceptional experience</p>
      </div>

      <!-- Error Message -->
      @if (error) {
        <div class="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
          <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm">{{ error }}</span>
        </div>
      }

      <!-- Register Form -->
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Full Name -->
        <div class="space-y-2">
          <label for="name" class="text-sm font-medium text-foreground block">
            Full Name <span class="text-destructive">*</span>
          </label>
          <input
            id="name"
            type="text"
            formControlName="name"
            class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="Enter your full name"
          />
          @if (registerForm.get('name')?.touched && registerForm.get('name')?.errors?.['required']) {
            <p class="text-sm text-destructive">Name is required</p>
          }
        </div>

        <!-- Email -->
        <div class="space-y-2">
          <label for="email" class="text-sm font-medium text-foreground block">
            Email <span class="text-destructive">*</span>
          </label>
          <input
            id="email"
            type="email"
            formControlName="email"
            class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="Enter your email"
          />
          @if (registerForm.get('email')?.touched && registerForm.get('email')?.errors?.['required']) {
            <p class="text-sm text-destructive">Email is required</p>
          }
          @if (registerForm.get('email')?.touched && registerForm.get('email')?.errors?.['email']) {
            <p class="text-sm text-destructive">Please enter a valid email</p>
          }
        </div>

        <!-- Phone Number -->
        <div class="space-y-2">
          <label for="phone" class="text-sm font-medium text-foreground block">
            Phone Number <span class="text-destructive">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            formControlName="phone"
            class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="+1 234 567 8900"
          />
          @if (registerForm.get('phone')?.touched && registerForm.get('phone')?.errors?.['required']) {
            <p class="text-sm text-destructive">Phone number is required</p>
          }
          @if (registerForm.get('phone')?.touched && registerForm.get('phone')?.errors?.['pattern']) {
            <p class="text-sm text-destructive">Please enter a valid phone number</p>
          }
        </div>

        <!-- Password -->
        <div class="space-y-2">
          <label for="password" class="text-sm font-medium text-foreground block">
            Password <span class="text-destructive">*</span>
          </label>
          <input
            id="password"
            type="password"
            formControlName="password"
            class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="Create a password"
          />
          @if (registerForm.get('password')?.touched && registerForm.get('password')?.errors?.['required']) {
            <p class="text-sm text-destructive">Password is required</p>
          }
          @if (registerForm.get('password')?.touched && registerForm.get('password')?.errors?.['minlength']) {
            <p class="text-sm text-destructive">Password must be at least 6 characters</p>
          }
        </div>

        <!-- Confirm Password -->
        <div class="space-y-2">
          <label for="confirmPassword" class="text-sm font-medium text-foreground block">
            Confirm Password <span class="text-destructive">*</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            formControlName="confirmPassword"
            class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="Confirm your password"
          />
          @if (registerForm.get('confirmPassword')?.touched && registerForm.get('confirmPassword')?.errors?.['required']) {
            <p class="text-sm text-destructive">Please confirm your password</p>
          }
          @if (registerForm.get('confirmPassword')?.touched && registerForm.errors?.['passwordMismatch']) {
            <p class="text-sm text-destructive">Passwords do not match</p>
          }
        </div>

        <!-- Password Requirements -->
        <div class="space-y-1 text-sm">
          <div [class]="registerForm.get('password')?.value?.length >= 6 ? 'flex items-center gap-2 text-success' : 'flex items-center gap-2 text-muted-foreground'">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>At least 6 characters</span>
          </div>
        </div>

        <!-- Submit Button -->
        <app-button 
          type="submit" 
          [disabled]="registerForm.invalid || isLoading"
          className="w-full h-11"
          size="lg"
        >
          @if (isLoading) {
            <app-loading-spinner size="sm" class="mr-2"></app-loading-spinner>
            Creating account...
          } @else {
            Create Account
          }
        </app-button>
      </form>

      <!-- Login Link -->
      <p class="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? 
        <a routerLink="/auth/login" class="text-primary font-medium hover:underline ml-1">
          Sign in
        </a>
      </p>
    </div>
  `,
    styles: []
})
export class RegisterComponent {
    registerForm: FormGroup;
    isLoading = false;
    error = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.pattern(/^[\+]?[\d\s-]{10,}$/)]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');

        if (!password || !confirmPassword) {
            return null;
        }

        return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    }

    onSubmit() {
        if (this.registerForm.valid) {
            this.isLoading = true;
            this.error = '';

            const { name, email, phone, password } = this.registerForm.value;

            this.authService.register({ name, email, phone, password }).subscribe({
                next: (user) => {
                    this.isLoading = false;
                    // Navigate to customer home after registration
                    this.router.navigate(['/customer/home']);
                },
                error: (err) => {
                    this.isLoading = false;
                    this.error = err.message || 'Registration failed. Please try again.';
                }
            });
        } else {
            this.registerForm.markAllAsTouched();
        }
    }
}
