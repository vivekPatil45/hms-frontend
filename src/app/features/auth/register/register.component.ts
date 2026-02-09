import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterData } from '../../../models/user.model';

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
    <div class="animate-fade-in max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-sm border border-border">
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-foreground">Customer Registration</h2>
        <p class="text-muted-foreground mt-2">Create your account to access our booking system</p>
      </div>

      <!-- Error Message -->
      @if (error) {
        <div class="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive animate-shake">
          <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-medium">{{ error }}</span>
        </div>
      }

      <!-- Register Form -->
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
        
        <!-- Full Name -->
        <div class="space-y-2">
          <label for="fullName" class="text-sm font-medium text-foreground block">
            Customer Name <span class="text-destructive">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            formControlName="fullName"
            class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="John Doe"
            [class.border-destructive]="isFieldInvalid('fullName')"
          />
          @if (isFieldInvalid('fullName')) {
            <p class="text-sm text-destructive mt-1">{{ getErrorMessage('fullName') }}</p>
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
            placeholder="john.doe@example.com"
            [class.border-destructive]="isFieldInvalid('email')"
          />
          @if (isFieldInvalid('email')) {
            <p class="text-sm text-destructive mt-1">{{ getErrorMessage('email') }}</p>
          }
        </div>

        <!-- Mobile Number -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground block">
            Mobile Number <span class="text-destructive">*</span>
          </label>
          <div class="flex gap-3">
            <select 
                formControlName="countryCode"
                class="flex h-11 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
            >
                <option value="+1">+1 (US)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+91">+91 (IN)</option>
                <option value="+61">+61 (AU)</option>
            </select>
            <input
                id="mobileNumber"
                type="tel"
                formControlName="mobileNumber"
                class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                placeholder="9876543210"
                [class.border-destructive]="isFieldInvalid('mobileNumber')"
            />
          </div>
          @if (isFieldInvalid('mobileNumber')) {
            <p class="text-sm text-destructive mt-1">{{ getErrorMessage('mobileNumber') }}</p>
          }
        </div>

        <!-- Address -->
        <div class="space-y-2">
          <label for="address" class="text-sm font-medium text-foreground block">
            Address <span class="text-destructive">*</span>
          </label>
          <textarea
            id="address"
            formControlName="address"
            rows="3"
            class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
            placeholder="Enter your full address"
            [class.border-destructive]="isFieldInvalid('address')"
          ></textarea>
          @if (isFieldInvalid('address')) {
            <p class="text-sm text-destructive mt-1">{{ getErrorMessage('address') }}</p>
          }
        </div>

        <!-- Username -->
        <div class="space-y-2">
          <label for="username" class="text-sm font-medium text-foreground block">
            Username <span class="text-destructive">*</span>
          </label>
          <input
            id="username"
            type="text"
            formControlName="username"
            class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="johndoe123"
            [class.border-destructive]="isFieldInvalid('username')"
          />
          @if (isFieldInvalid('username')) {
            <p class="text-sm text-destructive mt-1">{{ getErrorMessage('username') }}</p>
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
            placeholder="Create a strong password"
            [class.border-destructive]="isFieldInvalid('password')"
          />
          @if (isFieldInvalid('password')) {
            <p class="text-sm text-destructive mt-1">{{ getErrorMessage('password') }}</p>
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
            [class.border-destructive]="isFieldInvalid('confirmPassword')"
          />
          @if (isFieldInvalid('confirmPassword')) {
            <p class="text-sm text-destructive mt-1">{{ getErrorMessage('confirmPassword') }}</p>
          }
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4 pt-4">
            <button 
                type="button" 
                (click)="onReset()"
                class="flex-1 h-11 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                Reset
            </button>
            
            <app-button 
                type="submit" 
                [disabled]="registerForm.invalid || isLoading"
                className="flex-1 h-11"
                size="lg"
            >
                @if (isLoading) {
                    <app-loading-spinner size="sm" class="mr-2"></app-loading-spinner>
                    Registering...
                } @else {
                    Register
                }
            </app-button>
        </div>
      </form>

      <!-- Login Link -->
      <p class="mt-8 text-center text-sm text-muted-foreground">
        Already have an account? 
        <a routerLink="/auth/login" class="text-primary font-medium hover:underline ml-1">
          Login Now
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
      fullName: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z\\s]+$')
      ]],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['+91', [Validators.required]],
      mobileNumber: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{8,10}$')
      ]],
      address: ['', [
        Validators.required,
        Validators.minLength(10)
      ]],
      username: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern('^\\S+$') // No spaces
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
      ]],
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (fieldName === 'fullName') {
      if (field.errors['required']) return 'Customer Name is required';
      if (field.errors['minlength']) return 'Name must be at least 3 characters long';
      if (field.errors['pattern']) return 'Name must contain only letters';
    }

    if (fieldName === 'email') {
      if (field.errors['required']) return 'Email is required';
      if (field.errors['email']) return 'Enter a valid email address';
    }

    if (fieldName === 'mobileNumber') {
      if (field.errors['required']) return 'Mobile number is required';
      if (field.errors['pattern']) return 'Enter a valid mobile number (8-10 digits)';
    }

    if (fieldName === 'address') {
      if (field.errors['required']) return 'Address is required';
      if (field.errors['minlength']) return 'Address must be at least 10 characters long';
    }

    if (fieldName === 'username') {
      if (field.errors['required']) return 'Username is required';
      if (field.errors['minlength']) return 'Username must be at least 5 characters';
      if (field.errors['pattern']) return 'Username cannot contain spaces';
    }

    if (fieldName === 'password') {
      if (field.errors['required']) return 'Password is required';
      if (field.errors['minlength']) return 'Password must be at least 8 characters';
      if (field.errors['pattern']) return 'Password must include uppercase, lowercase, number, and special char';
    }

    if (fieldName === 'confirmPassword') {
      if (field.errors['required']) return 'Confirm Password is required';
      if (this.registerForm.errors?.['passwordMismatch']) return 'Passwords do not match';
    }

    return '';
  }

  onReset(): void {
    this.registerForm.reset({
      countryCode: '+91'
    });
    this.error = '';
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = '';

      const formValue = this.registerForm.value;

      // Format data for backend
      const registerData: RegisterData = {
        username: formValue.username,
        email: formValue.email,
        password: formValue.password,
        confirmPassword: formValue.confirmPassword,
        fullName: formValue.fullName,
        mobileNumber: `${formValue.countryCode}-${formValue.mobileNumber}`,
        address: formValue.address
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          // TODO: Navigate to acknowledgement screen
          // For now, redirect to login with success message or implement success screen
          console.log('Registered user:', response.data);
          this.router.navigate(['/auth/login'], {
            queryParams: { registered: 'true' }
          });
        },
        error: (err) => {
          this.isLoading = false;
          // Check for specific error message from backend
          if (err.error && err.error.message) {
            this.error = err.error.message;
          } else {
            // Fallback to generic message
            this.error = 'Registration failed. Please check your inputs and try again.';
          }
          console.error('Registration error details:', err);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
