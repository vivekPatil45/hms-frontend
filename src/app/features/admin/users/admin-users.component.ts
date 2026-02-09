import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminUserService } from '../../../core/services/admin-user.service';
import { CreateUserRequest, UpdateUserRequest, UserResponse } from '../../../models/user-management.model';
import { UserRole, UserStatus } from '../../../models/user.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">User Management</h1>
        <button 
          (click)="openCreateModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search by username..." 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
        
        <div class="w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select 
            [(ngModel)]="selectedRole" 
            (change)="loadUsers()"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option [ngValue]="null">All Roles</option>
            <option *ngFor="let role of userRoles" [value]="role">{{role}}</option>
          </select>
        </div>

        <div class="w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select 
            [(ngModel)]="selectedStatus" 
            (change)="loadUsers()"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option [ngValue]="null">All Statuses</option>
            <option *ngFor="let status of userStatuses" [value]="status">{{status}}</option>
          </select>
        </div>
      </div>

      <!-- User List Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th 
                  class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  (click)="onSort('username')"
                >
                  <div class="flex items-center gap-1">
                    Username
                    <span *ngIf="sortBy === 'username'">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
                  </div>
                </th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Full Name</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th 
                  class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  (click)="onSort('createdAt')"
                >
                  <div class="flex items-center gap-1">
                    Created At
                    <span *ngIf="sortBy === 'createdAt'">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
                  </div>
                </th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let user of users" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ user.username }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ user.fullName }}</td>
                <td class="px-6 py-4 text-sm">
                  <span class="px-2 py-1 text-xs font-medium rounded-full" 
                    [ngClass]="{
                      'bg-purple-100 text-purple-800': user.role === 'ADMIN',
                      'bg-blue-100 text-blue-800': user.role === 'STAFF',
                      'bg-green-100 text-green-800': user.role === 'CUSTOMER'
                    }">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm">
                  <span class="px-2 py-1 text-xs font-medium rounded-full"
                    [ngClass]="{
                      'bg-green-100 text-green-800': user.status === 'ACTIVE',
                      'bg-red-100 text-red-800': user.status === 'INACTIVE',
                      'bg-yellow-100 text-yellow-800': user.status === 'SUSPENDED'
                    }">
                    {{ user.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ user.createdAt | date:'mediumDate' }}</td>
                <td class="px-6 py-4 text-sm font-medium text-right">
                  <div class="flex justify-end gap-2">
                    <button 
                      (click)="openEditModal(user)"
                      class="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button 
                      *ngIf="user.status === 'ACTIVE'"
                      (click)="confirmDeactivate(user)"
                      class="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                      title="Deactivate"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </button>

                    <button 
                      *ngIf="user.status === 'INACTIVE'"
                      (click)="confirmActivate(user)"
                      class="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                      title="Activate"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>

                    <button 
                      (click)="confirmResetPassword(user)"
                      class="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded"
                      title="Reset Password"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="users.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                  No users found matching your criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Showing <span class="font-medium">{{ (currentPage * pageSize) + 1 }}</span> to 
            <span class="font-medium">{{ Math.min((currentPage + 1) * pageSize, totalElements) }}</span> of 
            <span class="font-medium">{{ totalElements }}</span> results
          </div>
          <div class="flex items-center gap-2">
            <button 
              [disabled]="currentPage === 0"
              (click)="onPageChange(currentPage - 1)"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              [disabled]="(currentPage + 1) * pageSize >= totalElements"
              (click)="onPageChange(currentPage + 1)"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- User Form Modal -->
    <div *ngIf="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 class="text-xl font-bold text-gray-800">{{ isEditMode ? 'Edit User' : 'Create User' }}</h2>
          <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Username *</label>
              <input 
                type="text" 
                formControlName="username"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="userForm.get('username')?.invalid && userForm.get('username')?.touched"
                [readonly]="isEditMode"
              >
              <p *ngIf="userForm.get('username')?.invalid && userForm.get('username')?.touched" class="mt-1 text-sm text-red-600">
                Username is required
              </p>
            </div>

            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input 
                type="text" 
                formControlName="fullName"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="userForm.get('fullName')?.invalid && userForm.get('fullName')?.touched"
              >
            </div>

            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input 
                type="email" 
                formControlName="email"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
              >
            </div>

            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
              <input 
                type="text" 
                formControlName="mobileNumber"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="userForm.get('mobileNumber')?.invalid && userForm.get('mobileNumber')?.touched"
              >
              <p *ngIf="userForm.get('mobileNumber')?.invalid && userForm.get('mobileNumber')?.touched" class="mt-1 text-sm text-red-600">
                <span *ngIf="userForm.get('mobileNumber')?.errors?.['required']">Mobile number is required</span>
                <span *ngIf="userForm.get('mobileNumber')?.errors?.['pattern']">Invalid format (10-20 digits, optional +, -, spaces)</span>
              </p>
            </div>

            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select 
                formControlName="role"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option *ngFor="let role of userRoles" [value]="role">{{role}}</option>
              </select>
            </div>

            <div class="col-span-1" *ngIf="isEditMode">
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                formControlName="status"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option *ngFor="let status of userStatuses" [value]="status">{{status}}</option>
              </select>
            </div>

            <div class="col-span-1 md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea 
                formControlName="address"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button 
              type="button" 
              (click)="closeModal()"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              [disabled]="userForm.invalid || isSubmitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <span *ngIf="isSubmitting" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              {{ isEditMode ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Success/Message Modal -->
    <div *ngIf="messageModal.isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div class="flex items-center gap-3 mb-4">
          <div [ngClass]="{'text-green-500': messageModal.type === 'success', 'text-blue-500': messageModal.type === 'info'}">
            <svg *ngIf="messageModal.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg *ngIf="messageModal.type === 'info'" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">{{ messageModal.title }}</h3>
        </div>
        
        <div class="text-gray-600 mb-6">
          <p>{{ messageModal.message }}</p>
          <div *ngIf="messageModal.data?.generatedPassword || messageModal.data?.newPassword" class="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <p class="text-sm text-gray-500 mb-1">Password:</p>
            <p class="font-mono text-lg font-bold text-gray-800 select-all">
              {{ messageModal.data?.generatedPassword || messageModal.data?.newPassword }}
            </p>
            <p class="text-xs text-red-500 mt-2">Please copy this password now. It will not be shown again.</p>
          </div>
        </div>

        <div class="flex justify-end">
          <button 
            (click)="closeMessageModal()"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  users: UserResponse[] = [];
  totalElements = 0;
  currentPage = 0;
  pageSize = 10;

  searchQuery = '';
  private searchSubject = new Subject<string>();

  selectedRole: UserRole | null = null;
  selectedStatus: UserStatus | null = null;
  sortBy = 'createdAt';
  sortDir = 'desc';

  userRoles = Object.values(UserRole);
  userStatuses = Object.values(UserStatus);

  isModalOpen = false;
  isEditMode = false;
  isSubmitting = false;
  selectedUserId: string | null = null;
  userForm: FormGroup;

  messageModal = {
    isOpen: false,
    type: 'success', // 'success' | 'info'
    title: '',
    message: '',
    data: null as any
  };

  protected readonly Math = Math;

  constructor(
    private adminUserService: AdminUserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9\-\s]{10,20}$/)]],
      role: [UserRole.CUSTOMER, Validators.required],
      status: [UserStatus.ACTIVE],
      address: ['']
    });

    // Setup debounce for search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.currentPage = 0;
      this.loadUsers();
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  loadUsers() {
    this.adminUserService.getAllUsers(
      this.currentPage,
      this.pageSize,
      this.searchQuery,
      this.selectedRole || undefined,
      this.selectedStatus || undefined,
      this.sortBy,
      this.sortDir
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.users = response.data.users;
          this.totalElements = response.data.totalElements;
        }
      },
      error: (error) => console.error('Error loading users:', error)
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }

  onSort(column: string) {
    if (this.sortBy === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDir = 'asc';
    }
    this.loadUsers();
  }

  openCreateModal() {
    this.isEditMode = false;
    this.selectedUserId = null;
    this.userForm.reset({
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE
    });
    this.isModalOpen = true;
  }

  openEditModal(user: UserResponse) {
    this.isEditMode = true;
    this.selectedUserId = user.userId;
    this.userForm.patchValue({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role,
      status: user.status,
      address: user.address
    });
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.userForm.reset();
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    this.isSubmitting = true;
    const formData = this.userForm.value;

    if (this.isEditMode && this.selectedUserId) {
      const updateRequest: UpdateUserRequest = {
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        role: formData.role,
        status: formData.status
      };

      this.adminUserService.updateUser(this.selectedUserId, updateRequest).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            this.closeModal();
            this.loadUsers();
            this.showMessage('Success', 'User updated successfully');
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          let errorMessage = error.error?.message || 'Failed to update user';
          if (error.error?.errors && Array.isArray(error.error.errors)) {
            const fieldErrors = error.error.errors.map((e: any) => e.message).join('\n');
            errorMessage = fieldErrors;
          }
          this.showMessage('Error', errorMessage, 'error');
        }
      });
    } else {
      const createRequest: CreateUserRequest = {
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        role: formData.role
      };

      this.adminUserService.createUser(createRequest).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success && response.data) {
            this.closeModal();
            this.loadUsers();
            this.showMessage('Success', 'User created successfully', 'success', response.data);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          let errorMessage = error.error?.message || 'Failed to create user';
          if (error.error?.errors && Array.isArray(error.error.errors)) {
            const fieldErrors = error.error.errors.map((e: any) => e.message).join('\n');
            errorMessage = fieldErrors; // Show only the validation messages for clarity
          }
          this.showMessage('Error', errorMessage, 'error');
        }
      });
    }
  }

  confirmDeactivate(user: UserResponse) {
    if (confirm(`Are you sure you want to deactivate ${user.username}?`)) {
      this.adminUserService.deactivateUser(user.userId).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUsers();
            this.showMessage('Success', 'User deactivated successfully');
          }
        },
        error: (error) => this.showMessage('Error', 'Failed to deactivate user')
      });
    }
  }

  confirmActivate(user: UserResponse) {
    if (confirm(`Are you sure you want to activate ${user.username}?`)) {
      this.adminUserService.activateUser(user.userId).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUsers();
            this.showMessage('Success', 'User activated successfully');
          }
        },
        error: (error) => this.showMessage('Error', 'Failed to activate user')
      });
    }
  }

  confirmResetPassword(user: UserResponse) {
    if (confirm(`Are you sure you want to reset password for ${user.username}?`)) {
      this.adminUserService.resetPassword(user.userId).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.showMessage('Success', 'Password reset successfully', 'success', response.data);
          }
        },
        error: (error) => this.showMessage('Error', 'Failed to reset password')
      });
    }
  }

  showMessage(title: string, message: string, type: 'success' | 'info' | 'error' = 'success', data: any = null) {
    this.messageModal = {
      isOpen: true,
      title,
      message,
      type: type === 'error' ? 'info' : type,
      data
    };
  }

  closeMessageModal() {
    this.messageModal.isOpen = false;
  }
}
