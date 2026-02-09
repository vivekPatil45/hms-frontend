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

        switch (currentUser.role) {
            case UserRole.CUSTOMER:
                router.navigate(['/customer/home']);
                break;
            case UserRole.ADMIN:
                router.navigate(['/admin/dashboard']);
                break;
            case UserRole.STAFF:
                router.navigate(['/staff/complaints']);
                break;
            default:
                router.navigate(['/auth/login']);
        }

        return false;
    };
};
