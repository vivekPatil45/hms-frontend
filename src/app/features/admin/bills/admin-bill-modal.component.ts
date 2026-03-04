import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AdminBillService } from '../../../core/services/admin-bill.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-bill-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in" *ngIf="isOpen">
      <div class="bg-card w-full max-w-3xl rounded-xl shadow-lg border border-border flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-border bg-muted/30 rounded-t-xl">
          <div>
            <h2 class="text-2xl font-bold font-syne text-foreground">{{ view === 'generate' ? 'Generate New Bill' : 'Edit Bill & Service Charges' }}</h2>
            <p class="text-muted-foreground text-sm mt-1">
              {{ view === 'generate' ? 'Calculate and generate a bill for an existing reservation' : 'Manage line items, discounts, and taxes' }}
            </p>
          </div>
          <button class="text-muted-foreground hover:text-foreground transition-colors outline-none focus:ring-2 focus:ring-primary/50 rounded-lg p-1" (click)="close()">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto flex-1 space-y-6">
          @if (error) {
            <div class="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm">
              {{ error }}
            </div>
          }

          <!-- View: Generate -->
          @if (view === 'generate') {
            <form #generateForm="ngForm" (ngSubmit)="generateBill(generateForm)" class="space-y-4">
              <div class="grid grid-cols-1 gap-4">
                <div>
                  <label class="block text-sm font-medium text-foreground mb-1">Reservation ID <span class="text-destructive">*</span></label>
                  <input type="text" [(ngModel)]="reservationId" name="reservationId" required #resId="ngModel" class="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground" placeholder="Enter Reservation ID (e.g. RES-XXXX)">
                  <div *ngIf="resId.invalid && resId.touched" class="text-xs text-destructive mt-1">
                    Reservation ID is required.
                  </div>
                </div>
              </div>
              <div class="flex justify-end pt-2">
                <app-button type="submit" [disabled]="generateForm.invalid || isLoading">
                  {{ isLoading ? 'Generating...' : 'Generate Bill' }}
                </app-button>
              </div>
              <p class="text-xs text-muted-foreground">Generating a bill calculates base room charges and default taxes. You can edit service charges afterward.</p>
            </form>
          }

          <!-- View: Edit -->
          @if (view === 'edit' && bill) {
             <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm bg-muted/40 p-4 rounded-xl border border-border">
                <div>
                  <div class="text-xs text-muted-foreground mb-1">Bill ID</div>
                  <div class="font-medium text-foreground">#{{ bill.billId }}</div>
                </div>
                <div>
                  <div class="text-xs text-muted-foreground mb-1">Reservation</div>
                  <div class="font-medium text-primary">{{ bill.reservation?.reservationId }}</div>
                </div>
                <div>
                  <div class="text-xs text-muted-foreground mb-1">Customer</div>
                  <div class="font-medium text-foreground">{{ bill.customer?.user?.fullName }}</div>
                </div>
                <div>
                  <div class="text-xs text-muted-foreground mb-1">Status</div>
                  <div class="font-medium" [class.text-green-600]="bill.paymentStatus === 'PAID'" [class.text-amber-500]="bill.paymentStatus !== 'PAID'">
                    {{ bill.paymentStatus }}
                  </div>
                </div>
             </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <!-- Left Column: Items List -->
              <div class="space-y-4">
                 <h3 class="font-semibold text-lg text-foreground flex justify-between items-center">
                   Line Items
                   <span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{{ bill.items?.length || 0 }} Items</span>
                 </h3>
                 
                 <div class="bg-card border border-border rounded-xl overflow-hidden">
                   <table class="w-full text-sm">
                      <thead>
                         <tr class="bg-muted/50 text-left text-muted-foreground border-b border-border">
                            <th class="py-3 px-4 font-medium">Description</th>
                            <th class="py-3 px-4 font-medium text-right">Price</th>
                            <th class="py-3 px-4 w-12 text-center"></th>
                         </tr>
                      </thead>
                      <tbody class="divide-y divide-border">
                         @for (item of bill.items; track item.itemId) {
                           <tr class="hover:bg-muted/30 transition-colors group">
                              <td class="py-3 px-4">
                                <div class="font-medium text-foreground">{{ item.description }}</div>
                                <div class="text-[10px] text-muted-foreground tracking-wider uppercase mt-0.5">
                                  {{ item.category }} &middot; Qty: {{ item.quantity }}
                                  @if (item.serviceDate) { &middot; {{ item.serviceDate | date:'short' }} }
                                </div>
                              </td>
                              <td class="py-3 px-4 text-right font-medium text-foreground">
                                ₹{{ item.totalPrice | number:'1.2-2' }}
                                @if (item.quantity > 1) {
                                  <div class="text-[10px] text-muted-foreground mt-0.5">₹{{ item.unitPrice | number:'1.2-2' }} each</div>
                                }
                              </td>
                              <td class="py-3 pr-4 text-right">
                                @if (item.category !== 'ROOM' && bill.paymentStatus !== 'PAID') {
                                  <button (click)="removeItem(item.itemId)" class="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" title="Remove Item">
                                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                }
                              </td>
                           </tr>
                         }
                      </tbody>
                   </table>
                 </div>

                 <!-- Add Item Form -->
                @if (bill.paymentStatus !== 'PAID') {
                  <div class="bg-card p-4 rounded-xl border border-border shadow-sm">
                      <h4 class="font-medium text-sm text-foreground mb-3 flex items-center">
                        <svg class="w-4 h-4 mr-1.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Add Service Charge
                      </h4>
                      <div class="space-y-3">
                         <div class="grid grid-cols-2 gap-3">
                             <div class="col-span-2 md:col-span-1">
                                 <label class="block text-xs font-medium text-muted-foreground mb-1">Service Type</label>
                                 <select [(ngModel)]="newItem.category" (change)="onServiceChange()" class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all">
                                    <option value="SERVICE">Room Service</option>
                                    <option value="SERVICE">Spa & Wellness</option>
                                    <option value="SERVICE">Laundry</option>
                                    <option value="FOOD">Minibar</option>
                                    <option value="OTHER">Other</option>
                                 </select>
                             </div>
                             <div class="col-span-2 md:col-span-1">
                                 <label class="block text-xs font-medium text-muted-foreground mb-1">Service Date</label>
                                 <input type="datetime-local" [(ngModel)]="newItem.serviceDate" class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all">
                             </div>
                         </div>
                         <div class="flex gap-3">
                           <div class="w-20">
                               <label class="block text-xs font-medium text-muted-foreground mb-1">Qty</label>
                               <input type="number" [(ngModel)]="newItem.quantity" min="1" class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all">
                           </div>
                           <div class="flex-1">
                               <label class="block text-xs font-medium text-muted-foreground mb-1">Unit Price (₹)</label>
                               <div class="relative">
                                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                                  <input type="number" [(ngModel)]="newItem.unitPrice" class="w-full px-3 py-2 pl-8 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all">
                               </div>
                           </div>
                           <div class="flex items-end">
                              <app-button variant="default" size="sm" (click)="addItemToBill()" [disabled]="isLoading">Add</app-button>
                           </div>
                         </div>
                      </div>
                  </div>
                }
              </div>

              <!-- Right Column: Bill Totals & Controls -->
              <div class="space-y-4">
                <h3 class="font-semibold text-lg text-foreground">Totals & Adjustments</h3>
                
                <div class="bg-card border border-border p-5 rounded-xl space-y-4 shadow-sm relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
                  
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-muted-foreground">Subtotal</span>
                    <span class="font-medium text-foreground">₹{{ bill.subtotal | number:'1.2-2' }}</span>
                  </div>
                  
                  <div class="flex justify-between items-center text-sm group">
                    <div class="flex items-center gap-2">
                      <span class="text-muted-foreground">Tax</span>
                      @if (bill.paymentStatus !== 'PAID') {
                          <div class="relative w-20 transform transition-transform group-focus-within:scale-105">
                             <input type="number" [(ngModel)]="editableTaxRate" class="w-full pr-6 pl-2 py-1 bg-background border border-border rounded-md text-xs text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" step="0.5">
                             <span class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">%</span>
                          </div>
                      } @else {
                          <span class="text-muted-foreground text-xs bg-muted/50 px-2 py-0.5 rounded-full">{{ bill.taxRate }}%</span>
                      }
                    </div>
                    <span class="font-medium text-foreground">₹{{ bill.taxAmount | number:'1.2-2' }}</span>
                  </div>

                  <div class="flex justify-between items-center text-sm group">
                    <div class="flex items-center gap-2">
                      <span class="text-muted-foreground">Discount</span>
                      @if (bill.paymentStatus !== 'PAID') {
                          <div class="relative w-24 transform transition-transform group-focus-within:scale-105">
                             <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">₹</span>
                             <input type="number" [(ngModel)]="editableDiscount" class="w-full pl-6 pr-2 py-1 bg-background border border-border rounded-md text-xs text-right focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground" min="0">
                          </div>
                      }
                    </div>
                    <span class="text-green-600 font-semibold tracking-wide">-₹{{ bill.discountAmount | number:'1.2-2' }}</span>
                  </div>

                  <div class="border-t border-dashed border-border/70 my-4"></div>

                  <div class="flex justify-between items-center text-lg">
                    <span class="font-bold text-foreground">Total Due</span>
                    <span class="font-black text-2xl text-primary tracking-tight">₹{{ bill.totalAmount | number:'1.2-2' }}</span>
                  </div>
                  
                  <div class="flex justify-between items-center text-sm pt-4 border-t border-border mt-4">
                    <span class="text-muted-foreground">Paid Amount</span>
                    <span class="font-medium text-foreground">₹{{ bill.paidAmount | number:'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between items-center text-sm mt-1">
                    <span class="text-muted-foreground font-medium">Balance</span>
                    <span class="font-bold text-[15px]" [class.text-destructive]="bill.balanceAmount > 0" [class.text-green-600]="bill.balanceAmount === 0">
                      ₹{{ bill.balanceAmount | number:'1.2-2' }}
                    </span>
                  </div>
                </div>

                @if (bill.paymentStatus !== 'PAID') {
                  <div class="pt-2">
                     <app-button class="w-full shadow-md shadow-primary/20" (click)="saveMetrics()" [disabled]="isLoading">Save Changes to Tax / Discount</app-button>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-border flex justify-end gap-3 rounded-b-xl bg-card">
          <app-button variant="outline" (click)="close()">{{ view === 'generate' ? 'Cancel' : 'Done' }}</app-button>
        </div>
      </div>
    </div>

    <!-- Confirm Remove Line Item Modal -->
    <div *ngIf="isConfirmRemoveOpen" class="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
      <div class="bg-card rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-destructive/10 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-foreground">Remove Line Item</h3>
        </div>
        <p class="text-muted-foreground mb-6">Are you sure you want to remove this line item? This action cannot be undone.</p>
        <div class="flex justify-end gap-3">
          <app-button variant="outline" (click)="isConfirmRemoveOpen = false; pendingRemoveItemId = null">Cancel</app-button>
          <app-button variant="destructive" (click)="doRemoveItem()">Remove</app-button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminBillModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() view: 'generate' | 'edit' = 'generate';
  @Input() bill: any = null;
  @Output() modalClosed = new EventEmitter<boolean>();

  reservationId = '';
  isLoading = false;
  error: string | null = null;
  pendingRemoveItemId: string | null = null;
  isConfirmRemoveOpen = false;

  // Editing logic
  editableTaxRate: number = 0;
  editableDiscount: number = 0;

  newItem = {
    category: 'SERVICE',
    description: 'Room Service Charge',
    quantity: 1,
    unitPrice: 20.00,
    serviceDate: ''
  };

  constructor(private adminBillService: AdminBillService, private toastService: ToastService) {
    this.resetNewItem();
  }

  resetNewItem() {
    // Format to yyyy-MM-ddThh:mm
    const now = new Date();
    // adjust for local timezone offset
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

    this.newItem = {
      category: 'SERVICE',
      description: 'Room Service Charge',
      quantity: 1,
      unitPrice: 20.00,
      serviceDate: now.toISOString().slice(0, 16)
    };
  }

  ngOnChanges() {
    if (this.isOpen) {
      this.error = '';
      this.reservationId = '';
      if (this.view === 'edit' && this.bill) {
        this.editableTaxRate = this.bill.taxRate;
        this.editableDiscount = this.bill.discountAmount;
      }
    }
  }

  onServiceChange() {
    const map: any = {
      'ROOM_SERVICE': { desc: 'Room Service Charge', price: 25.0 },
      'SPA': { desc: 'Spa & Wellness Access', price: 80.0 },
      'LAUNDRY': { desc: 'Laundry Services', price: 15.0 },
      'MINIBAR': { desc: 'Minibar Consumption', price: 10.0 },
      'OTHER': { desc: 'Miscellaneous Charge', price: 0.0 }
    };

    const details = map[this.newItem.category];
    if (details) {
      this.newItem.description = details.desc;
      this.newItem.unitPrice = details.price;
    }
  }

  generateBill(form: any) {
    if (form.invalid) {
      this.error = 'Please fill in all required fields accurately.';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.adminBillService.generateBill(this.reservationId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.toastService.success('Bill generated successfully!');
          this.reservationId = '';
          this.modalClosed.emit(true);
        } else {
          this.error = response.message || 'Failed to generate bill';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Error occurred while generating bill';
      }
    });
  }

  addItemToBill() {
    if (!this.bill) return;

    if (!this.newItem.unitPrice || this.newItem.unitPrice <= 0) {
      this.error = "Please enter a valid amount greater than 0.";
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.adminBillService.addBillItem(this.bill.billId, this.newItem).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.bill = response.data;
          this.updateEditableMetrics();
          this.resetNewItem();
        } else {
          this.error = response.message || 'Failed to add item';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Failed to add item';
      }
    });
  }

  removeItem(itemId: string) {
    this.pendingRemoveItemId = itemId;
    this.isConfirmRemoveOpen = true;
  }

  doRemoveItem() {
    const itemId = this.pendingRemoveItemId;
    if (!itemId || !this.bill) return;
    this.pendingRemoveItemId = null;
    this.isConfirmRemoveOpen = false;

    this.isLoading = true;
    this.error = null;
    this.adminBillService.removeBillItem(this.bill.billId, itemId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.bill = response.data;
          this.updateEditableMetrics();
          this.toastService.success('Line item removed successfully.');
        } else {
          this.error = response.message || 'Failed to remove item';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Failed to remove item';
      }
    });
  }

  saveMetrics() {
    if (!this.bill) return;
    this.isLoading = true;
    this.error = null;

    this.adminBillService.updateBillMetrics(this.bill.billId, this.editableTaxRate, this.editableDiscount).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.bill = res.data;
          // Confirm visually
          this.error = ''; // Note: success Toast usually goes here. But we just emit true if parent wants to refresh.
        } else {
          this.error = res.message || 'Failed to update metrics';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Failed to update metrics';
      }
    });
  }

  updateEditableMetrics() {
    if (this.bill) {
      this.editableTaxRate = this.bill.taxRate;
      this.editableDiscount = this.bill.discountAmount;
    }
  }

  close() {
    this.modalClosed.emit(false);
  }
}
