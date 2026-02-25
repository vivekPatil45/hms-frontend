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
        @for (complaint of filteredComplaints; track complaint.complaintId) {
          <div class="bg-card rounded-xl border border-border p-6 card-hover transition-all">
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex flex-wrap items-center gap-3 mb-2">
                  <h3 class="font-semibold text-lg text-foreground">{{ complaint.title }}</h3>
                  <app-status-badge [status]="complaint.status"></app-status-badge>
                  <span [class]="'px-2 py-0.5 rounded text-xs font-medium border ' + getPriorityClass(complaint.priority)">
                    {{ complaint.priority }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {{ complaint.description }}
                </p>
                <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {{ complaint.customer?.user?.fullName || 'Customer #' + (complaint.customer?.customerId || complaint.customerId) }}
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
              <div class="flex items-center gap-2 shrink-0">
                @if (complaint.status === 'OPEN') {
                  <app-button size="sm" (click)="quickStartWorking(complaint)">
                    Start Working
                  </app-button>
                }
                @if (complaint.status === 'IN_PROGRESS') {
                  <app-button variant="default" size="sm" (click)="viewComplaint(complaint)">
                    Mark Resolved
                  </app-button>
                }
                <app-button variant="ghost" size="sm" (click)="viewComplaint(complaint)">
                  Details
                </app-button>
              </div>
            </div>
          </div>
        }
      </div>

      @if (filteredComplaints.length === 0) {
        <div class="p-12 text-center border border-dashed border-border rounded-xl bg-muted/20">
          <svg class="h-12 w-12 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-medium text-foreground">All caught up!</h3>
          <p class="text-muted-foreground mt-1">
            No complaints matching your criteria.
          </p>
        </div>
      }
    </div>

    <!-- Details / Action Modal -->
    @if (selectedComplaint) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
        <div class="bg-card w-full max-w-4xl rounded-xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-border bg-muted/30">
            <div>
              <div class="flex items-center gap-3 mb-1">
                <h2 class="text-2xl font-bold text-foreground">{{ selectedComplaint.title }}</h2>
                <app-status-badge [status]="selectedComplaint.status"></app-status-badge>
              </div>
              <p class="text-muted-foreground text-sm flex items-center gap-2">
                <span>Complaint #{{ selectedComplaint.complaintId }}</span>
                <span>&bull;</span>
                <span>Customer: {{ selectedComplaint.customer?.user?.fullName || 'N/A' }}</span>
                <span>&bull;</span>
                <span>Submitted {{ selectedComplaint.createdAt | date:'medium' }}</span>
              </p>
            </div>
            <button class="text-muted-foreground hover:text-foreground transition-colors outline-none p-1" (click)="closeModal()">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body (Scrollable) -->
          <div class="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-6">
            
            <!-- Left Col: Details & Action History -->
            <div class="flex-1 space-y-6">
              <!-- Description -->
              <div class="bg-muted/30 rounded-lg p-5 border border-border/50">
                <h3 class="text-sm font-semibold text-foreground mb-2 flex items-center gap-2 tracking-wide uppercase">
                  <svg class="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                  Client's Issue
                </h3>
                <p class="text-sm text-foreground leading-relaxed">{{ selectedComplaint.description }}</p>
              </div>

              <!-- Extra Details Grid -->
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="bg-muted/30 rounded-lg p-4 border border-border/50 hover:bg-muted/40 transition-colors">
                  <span class="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Category</span>
                  <span class="font-medium text-foreground">{{ selectedComplaint.category }}</span>
                </div>
                <div class="bg-muted/30 rounded-lg p-4 border border-border/50 hover:bg-muted/40 transition-colors">
                  <span class="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Priority</span>
                  <span class="font-medium" [class]="getPriorityClass(selectedComplaint.priority)">{{ selectedComplaint.priority }}</span>
                </div>
              </div>

              <!-- Action History Timeline -->
              <div>
                <h3 class="font-semibold text-lg text-foreground mb-6 flex items-center gap-2">
                  <svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                  Resolution Journey
                </h3>
                @if (selectedComplaint.actionLog && selectedComplaint.actionLog.length > 0) {
                  <div class="space-y-6 relative border-l-2 border-border ml-3 pl-6 py-2">
                    @for (log of selectedComplaint.actionLog; track log.actionId) {
                      <div class="relative">
                        <div class="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-card shadow-sm"></div>
                        <div class="bg-card border border-border p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                          <div class="flex items-center justify-between mb-2">
                            <span class="font-semibold text-sm text-foreground">{{ log.performedBy }}</span>
                            <span class="text-xs text-muted-foreground">{{ log.timestamp | date:'short' }}</span>
                          </div>
                          <p class="text-sm text-muted-foreground leading-relaxed">{{ log.action }}</p>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="text-center p-8 bg-muted/20 rounded-xl border border-dashed border-border group cursor-default">
                    <svg class="h-10 w-10 mx-auto text-muted-foreground/50 mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <p class="text-sm text-muted-foreground uppercase tracking-widest font-medium">Clear Skies - No actions logged</p>
                  </div>
                }
              </div>
            </div>

            <!-- Right Col: Forms & Controls -->
            <div class="w-full md:w-80 space-y-6 flex-shrink-0">
              
              <!-- Log New Action Form -->
              <div class="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
                <h3 class="font-bold text-base text-foreground flex items-center gap-2">
                  <svg class="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  New Action
                </h3>
                <form (ngSubmit)="addAction()" class="space-y-4">
                  <div>
                    <input type="text" [(ngModel)]="actionForm.action" name="action" placeholder="What was done?" class="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all" required>
                  </div>
                  <div>
                    <textarea [(ngModel)]="actionForm.notes" name="notes" placeholder="Detailed notes (optional)..." rows="3" class="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all resize-none"></textarea>
                  </div>
                  <app-button type="submit" class="w-full" size="sm" [disabled]="!actionForm.action || isSubmitting">Add Note to Log</app-button>
                </form>
              </div>

              <!-- Status & Resolution Controllers -->
              @if (selectedComplaint.status !== 'RESOLVED' && selectedComplaint.status !== 'CLOSED') {
                <div class="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
                  <h3 class="font-bold text-base text-foreground">Status Update</h3>
                  <div class="flex gap-2">
                    <select [(ngModel)]="updateStatusForm.status" name="status" class="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all">
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                    </select>
                    <app-button (click)="updateStatus()" variant="outline" size="sm" [disabled]="!updateStatusForm.status || isSubmitting">Update</app-button>
                  </div>
                </div>

                <div class="bg-emerald-50/50 rounded-xl border border-emerald-200 p-6 shadow-sm space-y-5">
                  <h3 class="font-bold text-emerald-700 text-lg flex items-center gap-2">
                    <div class="p-1.5 bg-emerald-100 rounded-lg">
                      <svg class="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Resolution Detail
                  </h3>
                  <div class="relative group">
                    <textarea 
                      [(ngModel)]="resolveForm.resolutionNotes" 
                      name="resolutionNotes" 
                      placeholder="Describe how the issue was resolved..." 
                      rows="4" 
                      class="w-full px-4 py-3 text-sm bg-white border border-emerald-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-foreground transition-all resize-none shadow-sm placeholder:text-muted-foreground/60"
                    ></textarea>
                    <div class="absolute bottom-3 right-3 text-[10px] font-medium text-emerald-400 group-focus-within:text-emerald-500 transition-colors uppercase tracking-widest">Required for resolution</div>
                  </div>
                  <button 
                    type="button"
                    (click)="resolveComplaint()" 
                    [disabled]="!resolveForm.resolutionNotes || isSubmitting"
                    class="w-full h-12 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all group"
                  >
                    <svg class="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ isSubmitting ? 'Processing...' : 'Confirm Resolution' }}
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .card-hover:hover { transform: translateY(-4px); border-color: var(--primary); }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `]
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

  quickStartWorking(complaint: Complaint) {
    this.isSubmitting = true;
    this.staffService.updateStatus(complaint.complaintId, 'IN_PROGRESS', 'Staff started working on the complaint').subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.toastService.success('Status updated to In Progress');
          this.loadComplaints();
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.error('Failed to update status');
      }
    });
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

  getPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      'LOW': 'text-success border-success bg-success/10',
      'MEDIUM': 'text-warning border-warning bg-warning/10',
      'HIGH': 'text-destructive border-destructive bg-destructive/10',
      'URGENT': 'text-white border-destructive bg-destructive shadow-sm shadow-destructive/50 font-bold'
    };
    return classes[priority] || 'text-muted-foreground border-border bg-muted/10';
  }
}
