import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Complaint } from '../../../models/complaint.model';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';


@Component({
  selector: 'app-admin-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, StatusBadgeComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Complaints Management</h1>
          <p class="text-muted-foreground mt-1">
            Monitor and resolve customer complaints
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-card rounded-xl border border-border p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="text-sm font-medium text-foreground block mb-2">Status</label>
            <select 
              [(ngModel)]="filters.status" 
              (change)="applyFilters()"
              class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium text-foreground block mb-2">Category</label>
            <select 
              [(ngModel)]="filters.category" 
              (change)="applyFilters()"
              class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
              <option value="">All Categories</option>
              <option value="ROOM_ISSUE">Room Issue</option>
              <option value="SERVICE_ISSUE">Service Issue</option>
              <option value="BILLING_ISSUE">Billing Issue</option>
              <option value="STAFF_BEHAVIOR">Staff Behavior</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium text-foreground block mb-2">Priority</label>
            <select 
              [(ngModel)]="filters.priority" 
              (change)="applyFilters()"
              class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium text-foreground block mb-2">Date From</label>
            <input 
              type="date" 
              [(ngModel)]="filters.dateFrom" 
              (change)="applyFilters()"
              class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
          </div>
          <div>
            <label class="text-sm font-medium text-foreground block mb-2">Date To</label>
            <input 
              type="date" 
              [(ngModel)]="filters.dateTo" 
              (change)="applyFilters()"
              class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
          </div>
          <div class="md:col-span-4">
            <label class="text-sm font-medium text-foreground block mb-2">Search</label>
            <div class="relative">
              <input 
                type="text" 
                [(ngModel)]="filters.search" 
                (keyup.enter)="applyFilters()"
                placeholder="Search by Customer Name, ID, or Complaint ID..."
                class="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-foreground">
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading) {
        <div class="p-12 text-center">
          <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p class="text-muted-foreground mt-4">Loading complaints...</p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage && !isLoading) {
        <div class="p-6 bg-destructive/10 border border-destructive rounded-xl">
          <p class="text-destructive">{{ errorMessage }}</p>
          <app-button variant="outline" size="sm" (click)="loadComplaints()" class="mt-4">
            Try Again
          </app-button>
        </div>
      }

      <!-- Complaints Grid -->
      @if (!isLoading && !errorMessage) {
        @if (complaints.length === 0) {
          <div class="p-12 text-center border border-dashed border-border rounded-xl">
            <svg class="h-12 w-12 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="text-lg font-medium text-foreground">No complaints</h3>
            <p class="text-muted-foreground mt-1">
              All customer issues have been resolved.
            </p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (complaint of complaints; track complaint.complaintId) {
              <div class="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
                <!-- Header with Status and Date -->
                <div class="flex justify-between items-start mb-3">
                  <div class="flex items-center gap-2">
                    <app-status-badge [status]="complaint.status"></app-status-badge>
                    <span [class]="getPriorityClass(complaint.priority)">
                      {{ complaint.priority }}
                    </span>
                  </div>
                  <span class="text-xs text-muted-foreground">
                    {{ complaint.createdAt | date:'shortDate' }}
                  </span>
                </div>

                <!-- Complaint ID -->
                <div class="mb-3">
                  <span class="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                    {{ complaint.complaintId }}
                  </span>
                </div>

                <!-- Title and Description -->
                <h3 class="font-semibold text-lg text-foreground mb-2">{{ complaint.title }}</h3>
                <p class="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {{ complaint.description }}
                </p>

                <!-- Customer and Category Info -->
                <div class="space-y-2 mb-4">
                  <div class="flex items-center gap-2 text-sm">
                    <svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span class="text-muted-foreground">
                      {{ complaint.customer?.user?.fullName || 'Customer #' + (complaint.customer?.customerId || complaint.customerId || 'N/A') }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span class="text-muted-foreground">{{ complaint.category }}</span>
                  </div>
                  @if (complaint.assignedTo) {
                    <div class="flex items-center gap-2 text-sm">
                      <svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span class="text-primary font-medium">
                        Assigned: {{ getStaffName(complaint.assignedTo) }}
                      </span>
                    </div>
                  } @else {
                    <div class="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 italic">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Unassigned
                    </div>
                  }
                </div>

                <!-- Action Button -->
                <div class="flex gap-2">
                  <app-button variant="default" size="sm" class="flex-1" (click)="viewComplaint(complaint)">
                    View Details
                  </app-button>
                </div>
              </div>
            }
          </div>
        }
      }

      <!-- Complaint Details Modal -->
      @if (selectedComplaint) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="closeModal()">
          <div class="bg-card rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="sticky top-0 bg-card border-b border-border p-6 flex justify-between items-start">
              <div>
                <h2 class="text-2xl font-bold text-foreground">{{ selectedComplaint.title }}</h2>
                <p class="text-sm text-muted-foreground mt-1">ID: {{ selectedComplaint.complaintId }}</p>
              </div>
              <button (click)="closeModal()" class="text-muted-foreground hover:text-foreground">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-6 space-y-6">
              <!-- Complaint Info -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Status</label>
                  <div class="mt-1">
                    <app-status-badge [status]="selectedComplaint.status"></app-status-badge>
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Priority</label>
                  <p class="text-foreground mt-1">
                    <span [class]="getPriorityClass(selectedComplaint.priority)">{{ selectedComplaint.priority }}</span>
                  </p>
                </div>
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Category</label>
                  <p class="text-foreground mt-1">{{ selectedComplaint.category }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Customer</label>
                  <p class="text-foreground mt-1">
                    {{ selectedComplaint.customer?.user?.fullName || 'N/A' }}
                  </p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-medium text-muted-foreground">Email</p>
                  <p class="text-sm text-foreground mt-1">{{ selectedComplaint.customer?.user?.email || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-muted-foreground">Customer ID</p>
                  <p class="text-sm text-foreground mt-1">ID: {{ selectedComplaint.customer?.customerId || selectedComplaint.customerId }}</p>
                </div>
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Description</label>
                <p class="text-foreground whitespace-pre-wrap mt-1">{{ selectedComplaint.description }}</p>
              </div>

              <!-- Resolution Notes -->
              @if (selectedComplaint.resolutionNotes) {
                <div class="p-4 bg-muted rounded-lg">
                  <label class="text-sm font-medium text-foreground block mb-2">Resolution Notes</label>
                  <p class="text-sm text-muted-foreground whitespace-pre-wrap">{{ selectedComplaint.resolutionNotes }}</p>
                </div>
              }

              <!-- Activity Log -->
              @if (selectedComplaint.actionLog && selectedComplaint.actionLog.length > 0) {
                <div>
                  <label class="text-sm font-medium text-foreground block mb-3">Activity Log</label>
                  <div class="space-y-2">
                    @for (log of selectedComplaint.actionLog; track log.timestamp) {
                      <div class="p-3 bg-muted rounded-lg text-sm">
                        <div class="flex justify-between items-start mb-1">
                          <span class="font-medium text-foreground">{{ log.action }}</span>
                          <span class="text-xs text-muted-foreground">{{ log.timestamp | date:'short' }}</span>
                        </div>
                        <p class="text-muted-foreground">By: {{ log.performedBy }}</p>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Admin Actions -->
              <div class="border-t border-border pt-6 space-y-4">
                <h3 class="text-lg font-semibold text-foreground">Admin Actions</h3>

                <!-- Assign Staff (only if OPEN) -->
                @if (selectedComplaint.status === 'OPEN') {
                  <div class="p-4 bg-muted rounded-lg">
                    <label class="text-sm font-medium text-foreground block mb-2">Assign to Staff</label>
                    <div class="space-y-2">
                      <select 
                        [(ngModel)]="assignStaffId"
                        class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                        <option value="">Select Staff Member</option>
                        @for (staff of staffUsers; track staff.userId) {
                          <option [value]="staff.userId">{{ staff.fullName }} ({{ staff.email }})</option>
                        }
                      </select>
                      <app-button (click)="assignComplaint()" [disabled]="!assignStaffId || isSubmitting" class="w-full">
                        Assign to Selected Staff
                      </app-button>
                    </div>
                  </div>
                }

                <!-- Update Status -->
                <div class="p-4 bg-muted rounded-lg">
                  <label class="text-sm font-medium text-foreground block mb-2">Update Status</label>
                  <div class="space-y-2">
                    <select 
                      [(ngModel)]="updateStatusForm.status"
                      class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    <textarea 
                      [(ngModel)]="updateStatusForm.notes"
                      placeholder="Optional notes..."
                      rows="2"
                      class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"></textarea>
                    <app-button (click)="updateStatus()" [disabled]="!updateStatusForm.status || isSubmitting" class="w-full">
                      Update Status
                    </app-button>
                  </div>
                </div>

                <!-- Add Response -->
                <div class="p-4 bg-muted rounded-lg">
                  <label class="text-sm font-medium text-foreground block mb-2">Add Response</label>
                  <div class="space-y-2">
                    <input 
                      type="text" 
                      [(ngModel)]="responseForm.action"
                      placeholder="Action description (e.g., 'Investigated issue')"
                      class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                    <textarea 
                      [(ngModel)]="responseForm.notes"
                      placeholder="Optional additional notes..."
                      rows="2"
                      class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"></textarea>
                    <app-button (click)="addResponse()" [disabled]="!responseForm.action || isSubmitting" class="w-full">
                      Add Response
                    </app-button>
                  </div>
                </div>

                <!-- Resolve Complaint -->
                @if (selectedComplaint.status !== 'RESOLVED' && selectedComplaint.status !== 'CLOSED') {
                  <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <label class="text-sm font-medium text-foreground block mb-2">Resolve Complaint</label>
                    <div class="space-y-2">
                      <textarea 
                        [(ngModel)]="resolveForm.resolutionNotes"
                        placeholder="Resolution notes (required)..."
                        rows="3"
                        class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"></textarea>
                      <app-button (click)="resolveComplaint()" [disabled]="!resolveForm.resolutionNotes || isSubmitting" class="w-full" variant="default">
                        Mark as Resolved
                      </app-button>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class AdminComplaintsComponent implements OnInit {
  complaints: Complaint[] = [];
  selectedComplaint: Complaint | null = null;
  staffUsers: any[] = [];
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  // Filters
  filters = {
    status: '',
    category: '',
    priority: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  };

  // Form data for admin actions
  assignStaffId = '';
  updateStatusForm = {
    status: '',
    notes: ''
  };
  responseForm = {
    action: '',
    notes: ''
  };
  resolveForm = {
    resolutionNotes: ''
  };

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadComplaints();
    this.loadStaffUsers();
  }

  loadComplaints() {
    this.isLoading = true;
    this.errorMessage = '';

    const filterParams: any = {};
    if (this.filters.status) filterParams.status = this.filters.status;
    if (this.filters.category) filterParams.category = this.filters.category;
    if (this.filters.priority) filterParams.priority = this.filters.priority;
    if (this.filters.dateFrom) filterParams.dateFrom = this.filters.dateFrom;
    if (this.filters.dateTo) filterParams.dateTo = this.filters.dateTo;
    if (this.filters.search) filterParams.search = this.filters.search;

    this.adminService.getAllComplaints(filterParams).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Complaints API Response:', response);
        if (response.success && response.data) {
          // Filter out duplicates based on complaintId
          const uniqueComplaints = response.data.filter((complaint, index, self) =>
            index === self.findIndex((c) => c.complaintId === complaint.complaintId)
          );
          console.log('Total complaints received:', response.data.length);
          console.log('Unique complaints after filtering:', uniqueComplaints.length);
          this.complaints = uniqueComplaints;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading complaints', err);
        this.errorMessage = 'Unable to load complaints. Please try again later.';
      }
    });
  }

  loadStaffUsers() {
    this.adminService.getStaffUsers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.staffUsers = response.data;
          console.log('Staff users loaded:', this.staffUsers);
        }
      },
      error: (err) => {
        console.error('Error loading staff users', err);
      }
    });
  }

  applyFilters() {
    this.loadComplaints();
  }

  viewComplaint(complaint: Complaint) {
    this.selectedComplaint = complaint;
    // Initialize forms with current values
    this.updateStatusForm.status = complaint.status;
    this.updateStatusForm.notes = '';
    this.responseForm.action = '';
    this.responseForm.notes = '';
    this.resolveForm.resolutionNotes = '';
    this.assignStaffId = '';
  }

  closeModal() {
    this.selectedComplaint = null;
  }

  assignComplaint() {
    if (!this.selectedComplaint || !this.assignStaffId || this.isSubmitting) return;

    this.isSubmitting = true;
    this.adminService.assignComplaint(this.selectedComplaint.complaintId, this.assignStaffId).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success && response.data) {
          this.selectedComplaint = response.data;
          this.loadComplaints(); // Refresh list
          this.assignStaffId = '';
          this.toastService.success('Complaint assigned successfully!');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error assigning complaint', err);
        this.toastService.error('Failed to assign complaint. Please try again.');
      }
    });
  }

  updateStatus() {
    if (!this.selectedComplaint || !this.updateStatusForm.status || this.isSubmitting) return;

    this.isSubmitting = true;
    this.adminService.updateComplaintStatus(
      this.selectedComplaint.complaintId,
      this.updateStatusForm.status,
      this.updateStatusForm.notes || undefined
    ).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success && response.data) {
          this.selectedComplaint = response.data;
          this.loadComplaints(); // Refresh list
          this.updateStatusForm.notes = '';
          this.toastService.success('Status updated successfully!');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error updating status', err);
        this.toastService.error('Failed to update status. Please try again.');
      }
    });
  }

  addResponse() {
    if (!this.selectedComplaint || !this.responseForm.action || this.isSubmitting) return;

    this.isSubmitting = true;
    this.adminService.addComplaintResponse(
      this.selectedComplaint.complaintId,
      this.responseForm.action,
      this.responseForm.notes || undefined
    ).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success && response.data) {
          this.selectedComplaint = response.data;
          this.loadComplaints(); // Refresh list
          this.responseForm.action = '';
          this.responseForm.notes = '';
          this.toastService.success('Response added successfully!');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error adding response', err);
        this.toastService.error('Failed to add response. Please try again.');
      }
    });
  }

  resolveComplaint() {
    if (!this.selectedComplaint || !this.resolveForm.resolutionNotes || this.isSubmitting) return;

    this.isSubmitting = true;
    this.adminService.resolveComplaint(
      this.selectedComplaint.complaintId,
      this.resolveForm.resolutionNotes
    ).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success && response.data) {
          this.selectedComplaint = response.data;
          this.loadComplaints(); // Refresh list
          this.resolveForm.resolutionNotes = '';
          this.toastService.success('Complaint resolved successfully!');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error resolving complaint', err);
        this.toastService.error('Failed to resolve complaint. Please try again.');
      }
    });
  }

  getPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      'HIGH': 'text-xs px-2 py-1 rounded-full bg-red-100 text-red-700',
      'MEDIUM': 'text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700',
      'LOW': 'text-xs px-2 py-1 rounded-full bg-green-100 text-green-700'
    };
    return classes[priority] || 'text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700';
  }

  getStaffName(userId: string): string {
    const staff = this.staffUsers.find(s => s.userId === userId || s.id === userId);
    return staff ? staff.fullName : `Staff #${userId}`;
  }
}

