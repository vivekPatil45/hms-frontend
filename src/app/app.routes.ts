import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './shared/components/auth-layout/auth-layout.component';
import { DashboardLayoutComponent } from './shared/components/dashboard-layout/dashboard-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { CustomerHomeComponent } from './features/customer/home/customer-home.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

import { UserRole } from './models/user.model';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'customer/home',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        component: AuthLayoutComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            {
                path: 'change-password',
                loadComponent: () => import('./features/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent)
            },
            { path: '', redirectTo: 'login', pathMatch: 'full' }
        ]
    },
    {
        path: 'customer',
        component: DashboardLayoutComponent,
        canActivate: [authGuard, roleGuard([UserRole.CUSTOMER])],
        children: [
            { path: 'home', component: CustomerHomeComponent },
            {
                path: 'rooms',
                loadComponent: () => import('./features/customer/rooms/customer-rooms.component').then(m => m.CustomerRoomsComponent)
            },
            {
                path: 'history',
                loadComponent: () => import('./features/customer/history/customer-history.component').then(m => m.CustomerHistoryComponent)
            },
            {
                path: 'complaints',
                loadComponent: () => import('./features/customer/complaints/customer-complaints.component').then(m => m.CustomerComplaintsComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/customer/profile/customer-profile.component').then(m => m.CustomerProfileComponent)
            },
            {
                path: 'contact',
                loadComponent: () => import('./features/customer/contact-us/contact-us.component').then(m => m.ContactUsComponent)
            }
        ]
    },
    {
        path: 'admin',
        component: DashboardLayoutComponent,
        canActivate: [authGuard, roleGuard([UserRole.ADMIN])],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
            },
            {
                path: 'rooms',
                loadComponent: () => import('./features/admin/rooms/admin-rooms.component').then(m => m.AdminRoomsComponent)
            },
            {
                path: 'reservations',
                loadComponent: () => import('./features/admin/reservations/admin-reservations.component').then(m => m.AdminReservationsComponent)
            },
            {
                path: 'customers',
                loadComponent: () => import('./features/admin/customers/admin-customers.component').then(m => m.AdminCustomersComponent)
            },
            {
                path: 'bills',
                loadComponent: () => import('./features/admin/bills/admin-bills.component').then(m => m.AdminBillsComponent)
            },
            {
                path: 'complaints',
                loadComponent: () => import('./features/admin/complaints/admin-complaints.component').then(m => m.AdminComplaintsComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent)
            }
        ]
    },
    {
        path: 'staff',
        component: DashboardLayoutComponent,
        canActivate: [authGuard, roleGuard([UserRole.STAFF])],
        children: [
            {
                path: 'complaints',
                loadComponent: () => import('./features/staff/complaints/staff-complaints.component').then(m => m.StaffComplaintsComponent)
            }
        ]
    },
    // Fallback route
    { path: '**', redirectTo: 'auth/login' }
];
