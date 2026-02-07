import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
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
        <h2 class="text-3xl font-bold text-foreground">Welcome Back</h2>
        <p class="text-muted-foreground mt-2">Sign in to your account</p>
      </div>

      <!-- Demo Credentials -->
      <div class="mb-6 p-4 bg-muted/50 rounded-lg text-sm border border-border">
        <p class="font-semibold text-foreground mb-2">Demo Credentials:</p>
        <div class="space-y-1 text-muted-foreground">
          <p>Customer: customer&#64;hotel.com / password123</p>
          <p>Admin: admin&#64;hotel.com / admin123</p>
          <p>Staff: staff&#64;hotel.com / staff123</p>
        </div>
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

      <!-- Login Form -->
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
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
          @if (loginForm.get('email')?.touched && loginForm.get('email')?.errors?.['required']) {
            <p class="text-sm text-destructive">Email is required</p>
          }
          @if (loginForm.get('email')?.touched && loginForm.get('email')?.errors?.['email']) {
            <p class="text-sm text-destructive">Please enter a valid email</p>
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
            placeholder="Enter your password"
          />
          @if (loginForm.get('password')?.touched && loginForm.get('password')?.errors?.['required']) {
            <p class="text-sm text-destructive">Password is required</p>
          }
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              formControlName="rememberMe"
              class="rounded border-input h-4 w-4 text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <span class="text-muted-foreground">Remember me</span>
          </label>
          <a href="#" class="text-primary hover:underline font-medium">
            Forgot password?
          </a>
        </div>

        <!-- Submit Button -->
        <app-button 
          type="submit" 
          [disabled]="loginForm.invalid || isLoading"
          className="w-full h-11"
          size="lg"
        >
          @if (isLoading) {
            <app-loading-spinner size="sm" class="mr-2"></app-loading-spinner>
            Signing in...
          } @else {
            Sign In
          }
        </app-button>
      </form>

      <!-- Register Link -->
      <p class="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account? 
        <a routerLink="/auth/register" class="text-primary font-medium hover:underline ml-1">
          Create account
        </a>
      </p>
    </div>
  `,
    styles: []
})
export class LoginComponent {
    loginForm: FormGroup;
    isLoading = false;
    error = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]],
            rememberMe: [false]
        });
    }

    onSubmit() {
        if (this.loginForm.valid) {
            this.isLoading = true;
            this.error = '';

            const { email, password } = this.loginForm.value;

            this.authService.login({ email, password }).subscribe({
                next: (user) => {
                    this.isLoading = false;
                    // Navigate based on role
                    switch (user.role) {
                        case 'CUSTOMER':
                            this.router.navigate(['/customer/home']);
                            break;
                        case 'ADMIN':
                            this.router.navigate(['/admin/dashboard']);
                            break;
                        case 'STAFF':
                            this.router.navigate(['/staff/complaints']);
                            break;
                        default:
                            this.router.navigate(['/']);
                    }
                },
                error: (err) => {
                    this.isLoading = false;
                    this.error = err.message || 'Login failed. Please try again.';
                }
            });
        } else {
            this.loginForm.markAllAsTouched();
        }
    }
}
