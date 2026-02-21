import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AdminRoomService } from '../../../core/services/admin-room.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  // ... (skip template changes, they are unchanged up to export class)
  selector: 'app-admin-room-bulk-import',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="bg-card rounded-xl border border-border p-6">
      <h2 class="text-xl font-bold text-foreground mb-4">Bulk Import Rooms</h2>
      
      <div class="space-y-4">
        <div class="p-4 bg-muted/50 rounded-lg border border-border border-dashed">
          <div class="flex flex-col items-center justify-center text-center">
            <svg class="h-10 w-10 text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="text-sm text-muted-foreground mb-2">
              Upload a CSV file to import rooms in bulk.
            </p>
            <p class="text-xs text-muted-foreground mb-4">
              Ensure the columns match the template: RoomType, BedType, Price, etc.
            </p>
            
            <input 
              type="file" 
              accept=".csv"
              class="hidden" 
              #fileInput
              (change)="onFileSelected($event)"
            >
            
            <div class="flex gap-3">
              <app-button variant="outline" size="sm" (click)="downloadTemplate()">
                Download Template
              </app-button>
              <app-button size="sm" (click)="fileInput.click()">
                Select File
              </app-button>
            </div>
          </div>
        </div>

        @if (selectedFile) {
          <div class="flex items-center justify-between p-3 bg-background border border-border rounded-md">
            <span class="text-sm font-medium text-foreground truncate max-w-[200px]">
              {{ selectedFile.name }}
            </span>
            <button 
              class="text-muted-foreground hover:text-destructive transition-colors"
              (click)="clearFile()"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <app-button 
            class="w-full" 
            [disabled]="isUploading"
            (click)="uploadFile()"
          >
            @if (isUploading) {
              <app-loading-spinner size="sm" class="mr-2"></app-loading-spinner>
              Importing...
            } @else {
              Start Import
            }
          </app-button>
        }

        @if (importResult) {
          <div class="mt-4 p-4 rounded-lg" [ngClass]="{
            'bg-green-500/10 border-green-500/20': importResult.failure === 0,
            'bg-yellow-500/10 border-yellow-500/20': importResult.failure > 0
          }">
            <h3 class="font-medium mb-1" [ngClass]="{
              'text-green-600': importResult.failure === 0,
              'text-yellow-600': importResult.failure > 0
            }">
              Import Summary
            </h3>
            <div class="text-sm space-y-1">
              <p>Total Processed: {{ importResult.processed }}</p>
              <p class="text-green-600">Successful: {{ importResult.success }}</p>
              @if (importResult.failure > 0) {
                <p class="text-destructive">Failed: {{ importResult.failure }}</p>
                
                <div class="mt-2 pt-2 border-t border-border/10">
                  <p class="font-medium text-xs mb-1">Errors:</p>
                  <ul class="list-disc list-inside text-xs overflow-y-auto max-h-32">
                    @for (error of importResult.errors; track error) {
                      <li>{{ error }}</li>
                    }
                  </ul>
                </div>
              }
            </div>
          </div>
        }

        @if (errorMessage) {
          <div class="p-3 bg-destructive/10 border border-destructive text-destructive rounded-lg text-sm">
            {{ errorMessage }}
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class AdminRoomBulkImportComponent {
  selectedFile: File | null = null;
  isUploading = false;
  importResult: any = null;
  errorMessage = '';

  constructor(
    private adminRoomService: AdminRoomService,
    private toastService: ToastService
  ) { }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        this.errorMessage = 'Please upload a valid CSV file.';
        return;
      }
      this.selectedFile = file;
      this.errorMessage = '';
      this.importResult = null;
    }
  }

  clearFile() {
    this.selectedFile = null;
    this.errorMessage = '';
    this.importResult = null;
  }

  downloadTemplate() {
    this.adminRoomService.downloadTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'rooms_template.csv';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.errorMessage = 'Failed to download template.';
      }
    });
  }

  uploadFile() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.errorMessage = '';
    this.importResult = null;

    this.adminRoomService.bulkImportRooms(this.selectedFile).subscribe({
      next: (response) => {
        this.isUploading = false;
        if (response.success) {
          this.importResult = response.data;
          if (this.importResult.failure === 0) {
            this.selectedFile = null;
            this.toastService.success('Bulk upload is successful');
          }
        }
      },
      error: (error) => {
        this.isUploading = false;
        this.errorMessage = error.error?.message || 'Failed to import rooms.';
      }
    });
  }
}
