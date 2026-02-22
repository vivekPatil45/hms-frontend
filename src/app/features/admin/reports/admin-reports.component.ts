import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-reports',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="space-y-6 animate-fade-in">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Reports and Analytics</h1>
        <p class="text-muted-foreground mt-1">
          View comprehensive reports and hotel analytics.
        </p>
      </div>
      <div class="bg-card rounded-xl border border-border p-8 text-center">
        <div class="text-6xl mb-4">📊</div>
        <h3 class="text-xl font-semibold mb-2">Reports Module Under Construction</h3>
        <p class="text-muted-foreground">Comprehensive analytics will be available here soon.</p>
      </div>
    </div>
  `
})
export class AdminReportsComponent { }
