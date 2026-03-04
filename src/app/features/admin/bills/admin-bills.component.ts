import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { AdminBillService } from '../../../core/services/admin-bill.service';
import { finalize } from 'rxjs/operators';
import { AdminBillModalComponent } from './admin-bill-modal.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-bills',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, StatusBadgeComponent, AdminBillModalComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Bills & Payments</h1>
          <p class="text-muted-foreground mt-1">
            Manage billing and payment transactions
          </p>
        </div>
        <app-button (click)="openGenerateModal()">
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Generate Bill
        </app-button>
      </div>

      <!-- Search & Filters -->
      <div class="bg-card rounded-xl border border-border p-4 mb-6 space-y-4">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (keyup.enter)="onSearch()"
                placeholder="Search by Bill ID, Customer Name..." 
                class="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              >
            </div>
          </div>
          <div class="w-full md:w-48">
            <select 
              [(ngModel)]="paymentStatus"
              (change)="onSearch()"
              class="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground">
              <option value="">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="REFUNDED">Refunded</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          <div class="flex gap-2 w-full md:w-auto">
            <input 
              type="date" 
              [(ngModel)]="dateFrom"
              class="w-full md:w-auto px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            >
            <span class="flex items-center text-muted-foreground">-</span>
            <input 
              type="date" 
              [(ngModel)]="dateTo"
              class="w-full md:w-auto px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            >
          </div>
          <div class="flex gap-2">
             <app-button variant="outline" (click)="resetFilters()">Reset</app-button>
             <app-button (click)="onSearch()">Search</app-button>
          </div>
        </div>
      </div>

      <div class="bg-card rounded-xl border border-border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-muted/50 border-b border-border">
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm cursor-pointer hover:text-foreground" (click)="onSort('billId')">
                  <div class="flex items-center">
                    Bill ID
                    <svg class="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getSortIcon('billId')" /></svg>
                  </div>
                </th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm cursor-pointer hover:text-foreground" (click)="onSort('reservation.reservationId')">
                  <div class="flex items-center">
                    Reservation
                    <svg class="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getSortIcon('reservation.reservationId')" /></svg>
                  </div>
                </th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm cursor-pointer hover:text-foreground" (click)="onSort('customer.user.fullName')">
                  <div class="flex items-center">
                    Customer
                    <svg class="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getSortIcon('customer.user.fullName')" /></svg>
                  </div>
                </th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm cursor-pointer hover:text-foreground" (click)="onSort('totalAmount')">
                  <div class="flex items-center">
                    Amount
                    <svg class="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getSortIcon('totalAmount')" /></svg>
                  </div>
                </th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm cursor-pointer hover:text-foreground" (click)="onSort('paymentMethod')">
                  <div class="flex items-center">
                    Payment Method
                    <svg class="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getSortIcon('paymentMethod')" /></svg>
                  </div>
                </th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm cursor-pointer hover:text-foreground" (click)="onSort('billDate')">
                  <div class="flex items-center">
                    Date
                    <svg class="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getSortIcon('billDate')" /></svg>
                  </div>
                </th>
                <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm cursor-pointer hover:text-foreground" (click)="onSort('paymentStatus')">
                  <div class="flex items-center">
                    Status
                    <svg class="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getSortIcon('paymentStatus')" /></svg>
                  </div>
                </th>
                <th class="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @if (isLoading) {
                <tr>
                  <td colspan="8" class="py-12 text-center text-muted-foreground">
                    <div class="flex justify-center items-center">
                      <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </td>
                </tr>
              } @else if (bills.length === 0) {
                <tr>
                  <td colspan="8" class="py-12 text-center">
                    <div class="min-h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                      <svg class="h-12 w-12 mb-4 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <p class="text-lg font-medium text-foreground">No bills found</p>
                      <p class="text-sm mt-1">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (bill of bills; track $index) {
                  <tr class="hover:bg-muted/50 transition-colors">
                    <td class="py-3 px-4 font-medium text-foreground">#{{ bill.billId }}</td>
                    <td class="py-3 px-4 text-sm text-foreground">{{ bill.reservation?.reservationId }}</td>
                    <td class="py-3 px-4 text-sm text-foreground">{{ bill.customer?.user?.fullName }}</td>
                    <td class="py-3 px-4 text-sm font-medium text-foreground">₹{{ bill.totalAmount | number:'1.2-2' }}</td>
                    <td class="py-3 px-4 text-sm text-foreground">{{ bill.paymentMethod || 'N/A' }}</td>
                    <td class="py-3 px-4 text-sm text-foreground">
                      {{ bill.billDate | date:'shortDate' }}
                    </td>
                    <td class="py-3 px-4">
                      <app-status-badge [status]="bill.paymentStatus"></app-status-badge>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <app-button variant="ghost" size="sm" class="mr-2" (click)="openEditModal(bill)">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </app-button>
                      @if (bill.paymentStatus === 'PENDING') {
                        <app-button variant="outline" size="sm" (click)="markPaid(bill)">
                          Mark Paid
                        </app-button>
                      }
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20" *ngIf="totalElements > 0">
          <div class="flex items-center text-sm text-muted-foreground">
            Showing {{ currentPage * pageSize + 1 }} to {{ Math.min((currentPage + 1) * pageSize, totalElements) }} of {{ totalElements }} results
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <span class="text-sm text-muted-foreground">Rows per page:</span>
              <select 
                class="bg-background border border-border rounded-md text-sm py-1 pl-2 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50"
                [value]="pageSize"
                (change)="onPageSizeChange($event)">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            <div class="flex space-x-1">
              <button 
                (click)="previousPage()" 
                [disabled]="currentPage === 0"
                class="p-1 rounded-md text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                (click)="nextPage()" 
                [disabled]="currentPage >= totalPages - 1"
                class="p-1 rounded-md text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Generate / Edit Bill Modal -->
      <app-admin-bill-modal
        [isOpen]="isModalOpen"
        [view]="modalView"
        [bill]="selectedBill"
        (modalClosed)="onModalClosed($event)"
      ></app-admin-bill-modal>

      <!-- Confirm Pay Modal -->
      <div *ngIf="isConfirmPayOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2 bg-yellow-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5C2.962 18.333 3.924 20 5.464 20z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Confirm Payment</h3>
          </div>
          <p class="text-gray-600 mb-6">Are you sure you want to mark bill <strong>#{{ pendingPayBill?.billId }}</strong> as <strong>PAID</strong>?</p>
          <div class="flex justify-end gap-3">
            <button (click)="isConfirmPayOpen = false; pendingPayBill = null" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
            <button (click)="doMarkPaid()" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Yes, Mark as Paid</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class AdminBillsComponent implements OnInit {
  bills: any[] = [];
  isLoading = false;

  // Modal State
  isModalOpen = false;
  modalView: 'generate' | 'edit' = 'generate';
  selectedBill: any = null;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Sorting
  sortBy = 'createdAt';
  sortOrder = 'desc';

  // Filters
  searchQuery = '';
  dateFrom = '';
  dateTo = '';
  paymentStatus = '';
  minAmount = '';
  maxAmount = '';

  Math = Math;
  isConfirmPayOpen = false;
  pendingPayBill: any = null;

  constructor(private adminBillService: AdminBillService, private toastService: ToastService) { }

  ngOnInit() {
    this.loadBills();
  }

  loadBills() {
    this.isLoading = true;
    this.adminBillService.getAllBills(
      this.currentPage,
      this.pageSize,
      this.sortBy,
      this.sortOrder,
      this.searchQuery,
      this.dateFrom,
      this.dateTo,
      this.paymentStatus,
      this.minAmount,
      this.maxAmount
    ).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.bills = response.data.content;
          this.totalElements = response.data.totalElements;
          this.totalPages = response.data.totalPages;
        }
      },
      error: (error) => {
        console.error('Failed to load bills', error);
      }
    });
  }

  onSearch() {
    this.currentPage = 0;
    this.loadBills();
  }

  resetFilters() {
    this.searchQuery = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.paymentStatus = '';
    this.minAmount = '';
    this.maxAmount = '';
    this.currentPage = 0;
    this.loadBills();
  }

  onSort(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.loadBills();
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) return 'M8 9l4-4 4 4m0 6l-4 4-4-4';
    return this.sortOrder === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7';
  }

  // Pagination Controls
  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadBills();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadBills();
    }
  }

  onPageSizeChange(event: any) {
    this.pageSize = Number(event.target.value);
    this.currentPage = 0;
    this.loadBills();
  }

  // Modal Handlers
  openGenerateModal() {
    this.modalView = 'generate';
    this.selectedBill = null;
    this.isModalOpen = true;
  }

  openEditModal(bill: any) {
    this.modalView = 'edit';
    this.selectedBill = bill;
    this.isModalOpen = true;
  }

  onModalClosed(refresh: boolean) {
    this.isModalOpen = false;
    this.selectedBill = null;
    if (refresh) {
      this.loadBills();
    }
  }

  markPaid(bill: any) {
    this.pendingPayBill = bill;
    this.isConfirmPayOpen = true;
  }

  doMarkPaid() {
    const bill = this.pendingPayBill;
    if (!bill) return;
    this.isConfirmPayOpen = false;
    this.pendingPayBill = null;
    this.isLoading = true;
    this.adminBillService.markBillAsPaid(bill.billId, bill.balanceAmount, 'CASH').subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.toastService.success(`Bill #${bill.billId} marked as PAID.`);
          this.loadBills();
        } else {
          this.toastService.error(res.message || 'Failed to mark as paid');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error(err.error?.message || 'Failed to mark as paid');
      }
    });
  }
}
