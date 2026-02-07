import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../models/user.model';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
    return (route, state) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        const currentUser = authService.getCurrentUser();

        if (!currentUser) {
            router.navigate(['/auth/login']);
            return false;
        }

        if (allowedRoles.includes(currentUser.role)) {
            return true;
        }

        // Redirect to appropriate dashboard based on role
        switch (currentUser.role) {
            case 'CUSTOMER':
                router.navigate(['/customer/home']);
                break;
            case 'ADMIN':
                router.navigate(['/admin/dashboard']);
                break;
            case 'STAFF':
                router.navigate(['/staff/complaints']);
                break;
            default:
                router.navigate(['/auth/login']);
        }

        return false;
    };
};
