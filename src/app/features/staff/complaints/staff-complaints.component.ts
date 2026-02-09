import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Complaint } from '../../../models/complaint.model';
import { StaffService } from '../../../core/services/staff.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-staff-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, StatusBadgeComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div>
        <h1 class="text-3xl font-bold text-foreground">My Assigned Complaints</h1>
        <p class="text-muted-foreground mt-1">
          Manage and resolve customer complaints assigned to you
        </p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-card rounded-xl border border-border p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Open</p>
              <p class="text-2xl font-bold text-foreground">{{ getCountByStatus('OPEN') }}</p>
            </div>
            <div class="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
              <svg class="h-6 w-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-card rounded-xl border border-border p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">In Progress</p>
              <p class="text-2xl font-bold text-foreground">{{ getCountByStatus('IN_PROGRESS') }}</p>
            </div>
            <div class="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
              <svg class="h-6 w-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-card rounded-xl border border-border p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Resolved Today</p>
              <p class="text-2xl font-bold text-foreground">{{ getCountByStatus('RESOLVED') }}</p>
            </div>
            <div class="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <svg class="h-6 w-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Complaints List -->
      <div class="space-y-4">
        @for (complaint of complaints; track complaint.id) {
          <div class="bg-card rounded-xl border border-border p-6 card-hover">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="font-semibold text-lg text-foreground">{{ complaint.title }}</h3>
                  <app-status-badge [status]="complaint.status"></app-status-badge>
                  <span [class]="getPriorityClass(complaint.priority)">
                    {{ complaint.priority }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground mb-3">
                  {{ complaint.description }}
                </p>
                <div class="flex items-center gap-4 text-sm text-muted-foreground">
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Customer #{{ complaint.customerId }}
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {{ complaint.category }}
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ complaint.createdAt | date:'medium' }}
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                @if (complaint.status === 'OPEN') {
                  <app-button size="sm">
                    Start Working
                  </app-button>
                }
                @if (complaint.status === 'IN_PROGRESS') {
                  <app-button variant="default" size="sm">
                    Mark Resolved
                  </app-button>
                }
                <app-button variant="ghost" size="sm">
                  Details
                </app-button>
              </div>
            </div>
          </div>
        }
      </div>

      @if (complaints.length === 0) {
        <div class="p-12 text-center border border-dashed border-border rounded-xl">
          <svg class="h-12 w-12 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-medium text-foreground">All caught up!</h3>
          <p class="text-muted-foreground mt-1">
            No complaints assigned to you at the moment.
          </p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class StaffComplaintsComponent implements OnInit {
  complaints: Complaint[] = [];
  filteredComplaints: Complaint[] = [];
  selectedComplaint: Complaint | null = null;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  // Filter properties
  filters = {
    status: '',
    priority: '',
    search: ''
  };

  // Form data
  actionForm = {
    action: '',
    notes: ''
  };

  updateStatusForm = {
    status: '',
    notes: ''
  };

  resolveForm = {
    resolutionNotes: ''
  };

  constructor(
    private staffService: StaffService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadComplaints();
  }

  loadComplaints() {
    this.isLoading = true;
    this.errorMessage = '';

    this.staffService.getMyComplaints().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.complaints = response.data;
          this.applyFilters();
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading complaints', err);
        this.errorMessage = 'Unable to load complaints. Please try again later.';
      }
    });
  }

  applyFilters() {
    this.filteredComplaints = this.complaints.filter(complaint => {
      const matchesStatus = !this.filters.status || complaint.status === this.filters.status;
      const matchesPriority = !this.filters.priority || complaint.priority === this.filters.priority;
      const matchesSearch = !this.filters.search ||
        complaint.title.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        complaint.complaintId.toLowerCase().includes(this.filters.search.toLowerCase());

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }
  viewComplaint(complaint: Complaint) {
    this.selectedComplaint = complaint;
    this.actionForm = { action: '', notes: '' };
    this.updateStatusForm = { status: complaint.status, notes: '' };
    this.resolveForm = { resolutionNotes: '' };
  }

  closeModal() {
    this.selectedComplaint = null;
  }

  addAction() {
    if (!this.selectedComplaint || !this.actionForm.action) return;

    this.isSubmitting = true;
    this.staffService.addAction(
      this.selectedComplaint.complaintId,
      this.actionForm.action,
      this.actionForm.notes
    ).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success && response.data) {
          this.selectedComplaint = response.data;
          this.loadComplaints();
          this.actionForm = { action: '', notes: '' };
          this.toastService.success('Action logged successfully!');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error adding action', err);
        this.toastService.error('Failed to log action. Please try again.');
      }
    });
  }

  updateStatus() {
    if (!this.selectedComplaint || !this.updateStatusForm.status) return;

    this.isSubmitting = true;
    this.staffService.updateStatus(
      this.selectedComplaint.complaintId,
      this.updateStatusForm.status,
      this.updateStatusForm.notes
    ).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success && response.data) {
          this.selectedComplaint = response.data;
          this.loadComplaints();
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

  resolveComplaint() {
    if (!this.selectedComplaint || !this.resolveForm.resolutionNotes) return;

    this.isSubmitting = true;
    this.staffService.resolveComplaint(
      this.selectedComplaint.complaintId,
      this.resolveForm.resolutionNotes
    ).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success && response.data) {
          this.selectedComplaint = response.data;
          this.loadComplaints();
          this.resolveForm.resolutionNotes = '';
          this.toastService.success('Complaint resolved successfully!');
          this.closeModal();
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error resolving complaint', err);
        this.toastService.error('Failed to resolve complaint. Please try again.');
      }
    });
  }

  getCountByStatus(status: string): number {
    return this.complaints.filter(c => c.status === status).length;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'OPEN': 'bg-warning/10 text-warning border-warning',
      'IN_PROGRESS': 'bg-info/10 text-info border-info',
      'RESOLVED': 'bg-success/10 text-success border-success',
      'CLOSED': 'bg-muted text-muted-foreground border-border'
    };
    return classes[status] || classes['OPEN'];
  }

  getPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      'LOW': 'bg-success/10 text-success border-success',
      'MEDIUM': 'bg-warning/10 text-warning border-warning',
      'HIGH': 'bg-destructive/10 text-destructive border-destructive',
      'URGENT': 'bg-destructive text-destructive-foreground border-destructive'
    };
    return classes[priority] || classes['MEDIUM'];
  }
}
