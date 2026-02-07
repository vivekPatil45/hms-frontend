import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Complaint } from '../../../models/complaint.model';
import { COMPLAINT_CATEGORIES } from '../../../shared/utils/constants';

@Component({
    selector: 'app-customer-complaints',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonComponent,
        StatusBadgeComponent,
        ModalComponent
    ],
    template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Complaints</h1>
          <p class="text-muted-foreground mt-1">
            Report issues or provide feedback
          </p>
        </div>
        <app-button (click)="openNewComplaintModal()">
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Complaint
        </app-button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (complaint of complaints; track complaint.id) {
          <div class="bg-card rounded-xl border border-border p-6 card-hover">
            <div class="flex justify-between items-start mb-4">
              <app-status-badge [status]="complaint.status"></app-status-badge>
              <span class="text-xs text-muted-foreground">
                {{ complaint.createdAt | date:'shortDate' }}
              </span>
            </div>
            
            <h3 class="font-semibold text-lg text-foreground mb-2">{{ complaint.title }}</h3>
            <p class="text-sm text-muted-foreground mb-4 line-clamp-2">
              {{ complaint.description }}
            </p>
            
            <div class="flex items-center justify-between pt-4 border-t border-border">
              <span class="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                {{ complaint.category }}
              </span>
              <span [class]="getPriorityClass(complaint.priority)">
                {{ complaint.priority }}
              </span>
            </div>
          </div>
        }
      </div>

      @if (complaints.length === 0) {
        <div class="p-12 text-center border border-dashed border-border rounded-xl">
          <svg class="h-12 w-12 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="text-lg font-medium text-foreground">No complaints found</h3>
          <p class="text-muted-foreground mt-1">
            You haven't reported any issues yet.
          </p>
        </div>
      }
    </div>

    <!-- New Complaint Modal -->
    <app-modal
      [isOpen]="isModalOpen"
      title="File a Complaint"
      (close)="closeModal()"
    >
      <form [formGroup]="complaintForm" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <!-- Title -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Subject</label>
            <input
              type="text"
              formControlName="title"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Brief summary of the issue"
            />
          </div>

          <!-- Category -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Category</label>
            <select
              formControlName="category"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="" disabled selected>Select a category</option>
              @for (category of categories; track category) {
                <option [value]="category">{{ category }}</option>
              }
            </select>
          </div>

          <!-- Description -->
          <div class="space-y-2">
             <label class="text-sm font-medium text-foreground">Description</label>
            <textarea
              formControlName="description"
              rows="4"
              class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Please provide details about the issue..."
            ></textarea>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3" footer>
          <app-button variant="ghost" (click)="closeModal()" type="button">
            Cancel
          </app-button>
          <app-button type="submit" [disabled]="complaintForm.invalid">
            Submit Complaint
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
    styles: []
})
export class CustomerComplaintsComponent {
    complaints: Complaint[] = [
        {
            id: 1,
            customerId: 1,
            title: 'AC not cooling',
            description: 'The air conditioner in room 101 is not cooling properly even at lowest setting.',
            category: 'Maintenance',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            createdAt: '2024-03-16T10:30:00Z'
        },
        {
            id: 2,
            customerId: 1,
            title: 'Noisy neighbors',
            description: 'Guests in the adjacent room are playing loud music late at night.',
            category: 'Noise',
            priority: 'MEDIUM',
            status: 'RESOLVED',
            createdAt: '2024-03-15T23:15:00Z'
        }
    ];

    categories = COMPLAINT_CATEGORIES;
    isModalOpen = false;
    complaintForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.complaintForm = this.fb.group({
            title: ['', Validators.required],
            category: ['', Validators.required],
            description: ['', Validators.required]
        });
    }

    getPriorityClass(priority: string): string {
        const classes = {
            'LOW': 'text-info',
            'MEDIUM': 'text-warning',
            'HIGH': 'text-destructive',
            'URGENT': 'text-destructive font-bold'
        };
        return `text-xs font-bold ${classes[priority as keyof typeof classes] || 'text-muted-foreground'}`;
    }

    openNewComplaintModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
        this.complaintForm.reset();
    }

    onSubmit() {
        if (this.complaintForm.valid) {
            console.log('Complaint submitted:', this.complaintForm.value);
            this.closeModal();
            // Logic to add to complaints list
        }
    }
}
