import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, LoginCredentials, RegisterData } from '../../models/user.model';
import { STORAGE_KEYS } from '../../shared/utils/constants';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject: BehaviorSubject<User | null>;
    public currentUser$: Observable<User | null>;

    constructor() {
        const storedUser = this.getStoredUser();
        this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
        this.currentUser$ = this.currentUserSubject.asObservable();
    }

    /**
     * Get current user value
     */
    public getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    /**
     * Check if user is authenticated
     */
    public isAuthenticated(): boolean {
        return !!this.currentUserSubject.value && !!this.getToken();
    }

    /**
     * Login user
     */
    public login(credentials: LoginCredentials): Observable<User> {
        // TODO: Replace with actual API call
        return new Observable(observer => {
            // Mock login with demo credentials
            setTimeout(() => {
                // Determine role based on email
                let role: 'CUSTOMER' | 'ADMIN' | 'STAFF' = 'CUSTOMER';
                let name = 'User';

                if (credentials.email === 'customer@hotel.com' && credentials.password === 'password123') {
                    role = 'CUSTOMER';
                    name = 'John Customer';
                } else if (credentials.email === 'admin@hotel.com' && credentials.password === 'admin123') {
                    role = 'ADMIN';
                    name = 'Admin User';
                } else if (credentials.email === 'staff@hotel.com' && credentials.password === 'staff123') {
                    role = 'STAFF';
                    name = 'Staff Member';
                } else {
                    observer.error({ message: 'Invalid credentials. Please use demo credentials.' });
                    return;
                }

                const mockUser: User = {
                    id: Date.now(),
                    name: name,
                    email: credentials.email,
                    role: role,
                    phone: '+1 (555) 123-4567',
                    createdAt: new Date().toISOString()
                };

                const mockToken = 'mock-jwt-token-' + Date.now();

                this.setSession(mockUser, mockToken);
                observer.next(mockUser);
                observer.complete();
            }, 1000);
        });
    }

    /**
     * Register new user
     */
    public register(data: RegisterData): Observable<User> {
        // TODO: Replace with actual API call
        return new Observable(observer => {
            setTimeout(() => {
                const mockUser: User = {
                    id: Date.now(),
                    name: data.name,
                    email: data.email,
                    role: 'CUSTOMER',
                    phone: data.phone || '',
                    createdAt: new Date().toISOString()
                };

                const mockToken = 'mock-jwt-token-' + Date.now();

                this.setSession(mockUser, mockToken);
                observer.next(mockUser);
                observer.complete();
            }, 1000);
        });
    }

    /**
     * Logout user
     */
    public logout(): void {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        this.currentUserSubject.next(null);
    }

    /**
     * Get stored token
     */
    public getToken(): string | null {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    }

    /**
     * Set user session
     */
    private setSession(user: User, token: string): void {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        this.currentUserSubject.next(user);
    }

    /**
     * Get stored user from localStorage
     */
    private getStoredUser(): User | null {
        const userJson = localStorage.getItem(STORAGE_KEYS.USER);
        if (userJson) {
            try {
                return JSON.parse(userJson);
            } catch {
                return null;
            }
        }
        return null;
    }

    /**
     * Update user profile
     */
    public updateProfile(user: Partial<User>): Observable<User> {
        return new Observable(observer => {
            setTimeout(() => {
                const currentUser = this.getCurrentUser();
                if (currentUser) {
                    const updatedUser = { ...currentUser, ...user };
                    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
                    this.currentUserSubject.next(updatedUser);
                    observer.next(updatedUser);
                }
                observer.complete();
            }, 500);
        });
    }
}
