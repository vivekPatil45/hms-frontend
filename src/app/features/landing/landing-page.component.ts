import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="min-h-screen bg-background text-foreground">

      <!-- Navbar -->
      <nav class="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <div class="flex items-center gap-2">
              <svg class="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span class="text-xl font-bold tracking-tight text-primary">Grand Stay</span>
            </div>

            <!-- Desktop Nav -->
            <div class="hidden md:flex items-center gap-8">
              <a href="#rooms" class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Rooms</a>
              <a href="#facilities" class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Facilities</a>
              <a href="#amenities" class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Amenities</a>
              <a href="#contact" class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Contact</a>
              <a routerLink="/auth/login" class="px-4 py-2 text-sm font-medium border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">
                Login
              </a>
              <a routerLink="/auth/register" class="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                Register
              </a>
            </div>

            <!-- Mobile menu button -->
            <button (click)="mobileMenuOpen.set(!mobileMenuOpen())" class="md:hidden text-foreground p-1">
              @if (mobileMenuOpen()) {
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              } @else {
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              }
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        @if (mobileMenuOpen()) {
          <div class="md:hidden bg-background border-t border-border px-4 py-4 space-y-3">
            <a href="#rooms" (click)="mobileMenuOpen.set(false)" class="block text-sm text-muted-foreground hover:text-primary">Rooms</a>
            <a href="#facilities" (click)="mobileMenuOpen.set(false)" class="block text-sm text-muted-foreground hover:text-primary">Facilities</a>
            <a href="#amenities" (click)="mobileMenuOpen.set(false)" class="block text-sm text-muted-foreground hover:text-primary">Amenities</a>
            <a href="#contact" (click)="mobileMenuOpen.set(false)" class="block text-sm text-muted-foreground hover:text-primary">Contact</a>
            <div class="flex gap-3 pt-2">
              <a routerLink="/auth/login" class="flex-1 text-center px-4 py-2 text-sm font-medium border border-primary text-primary rounded-md">Login</a>
              <a routerLink="/auth/register" class="flex-1 text-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md">Register</a>
            </div>
          </div>
        }
      </nav>

      <!-- Hero Section -->
      <section class="relative h-screen flex items-center justify-center overflow-hidden">
        <img src="assets/room3.png" alt="Grand Stay Hotel" class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <p class="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-medium">Welcome to</p>
          <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Grand Stay Hotel
          </h1>
          <p class="text-lg sm:text-xl text-white/80 mb-10 max-w-xl mx-auto">
            Experience unparalleled luxury, world-class dining, and breathtaking views in the heart of Pune.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/auth/register" class="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors text-lg shadow-lg">
              Book Your Stay
            </a>
            <a href="#rooms" class="px-8 py-3 border-2 border-white text-white font-semibold rounded-md hover:bg-white/10 transition-colors text-lg">
              Explore Rooms
            </a>
          </div>
        </div>
        <!-- Scroll indicator -->
        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg class="h-6 w-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </div>
      </section>

      <!-- Rooms Section -->
      <section id="rooms" class="py-24 px-4 bg-background">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-14">
            <p class="text-primary uppercase tracking-[0.2em] text-sm font-medium mb-2">Accommodations</p>
            <h2 class="text-3xl sm:text-4xl font-bold text-foreground">Our Rooms & Suites</h2>
            <p class="text-muted-foreground mt-3 max-w-lg mx-auto">Each room is thoughtfully designed to provide the ultimate comfort and luxury experience.</p>
          </div>
          <div class="grid md:grid-cols-3 gap-8">
            @for (room of rooms; track room.name) {
              <div class="group rounded-xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div class="overflow-hidden h-56">
                  <img [src]="room.image" [alt]="room.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </div>
                <div class="p-6">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="text-xl font-semibold text-card-foreground">{{ room.name }}</h3>
                    <span class="text-primary font-bold text-lg">{{ room.price }}<span class="text-xs text-muted-foreground font-normal">/night</span></span>
                  </div>
                  <p class="text-muted-foreground text-sm mb-5">{{ room.desc }}</p>
                  <a routerLink="/auth/register" class="block w-full text-center py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                    Book Now
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Facilities Section -->
      <section id="facilities" class="py-24 px-4 bg-muted/50">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-14">
            <p class="text-primary uppercase tracking-[0.2em] text-sm font-medium mb-2">World-Class</p>
            <h2 class="text-3xl sm:text-4xl font-bold text-foreground">Hotel Facilities</h2>
            <p class="text-muted-foreground mt-3 max-w-lg mx-auto">Indulge in our premium facilities designed for your relaxation and enjoyment.</p>
          </div>
          <div class="grid md:grid-cols-3 gap-8">
            @for (f of facilities; track f.name) {
              <div class="group relative rounded-xl overflow-hidden h-80 shadow-md">
                <img [src]="f.image" [alt]="f.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div class="absolute bottom-0 left-0 right-0 p-6">
                  <h3 class="text-xl font-bold text-white mb-1">{{ f.name }}</h3>
                  <p class="text-white/75 text-sm">{{ f.desc }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Amenities Section -->
      <section id="amenities" class="py-24 px-4 bg-background">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-14">
            <p class="text-primary uppercase tracking-[0.2em] text-sm font-medium mb-2">Everything You Need</p>
            <h2 class="text-3xl sm:text-4xl font-bold text-foreground">Amenities & Services</h2>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            @for (a of amenities; track a.label) {
              <div class="flex flex-col items-center text-center p-6 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all duration-200">
                <div class="mb-3 text-primary" [innerHTML]="a.icon"></div>
                <span class="text-sm font-medium text-card-foreground">{{ a.label }}</span>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Testimonial / CTA -->
      <section class="py-24 px-4 bg-primary text-primary-foreground">
        <div class="max-w-3xl mx-auto text-center">
          <svg class="h-10 w-10 mx-auto mb-4 opacity-80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <blockquote class="text-2xl sm:text-3xl font-light italic mb-6 leading-relaxed">
            "An unforgettable experience. The service, the rooms, the dining — everything was absolutely perfect."
          </blockquote>
          <p class="font-semibold mb-8">— Sarah Mitchell, Travel &amp; Leisure Magazine</p>
          <a routerLink="/auth/register" class="inline-block px-8 py-3 bg-primary-foreground text-primary font-semibold rounded-md hover:opacity-90 transition-opacity text-lg shadow-md">
            Reserve Your Room Today
          </a>
        </div>
      </section>

      <!-- Contact / Footer -->
      <footer id="contact" class="bg-card border-t border-border py-16 px-4">
        <div class="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <svg class="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span class="text-lg font-bold text-primary">Grand Stay Hotel</span>
            </div>
            <p class="text-muted-foreground text-sm leading-relaxed">
              Luxury redefined. Since 1998, Grand Stay has been the premier destination for discerning travelers seeking the finest in hospitality.
            </p>
          </div>
          <div>
            <h4 class="font-semibold text-card-foreground mb-4">Quick Links</h4>
            <div class="space-y-2 text-sm">
              <a href="#rooms" class="block text-muted-foreground hover:text-primary transition-colors">Rooms &amp; Suites</a>
              <a href="#facilities" class="block text-muted-foreground hover:text-primary transition-colors">Facilities</a>
              <a href="#amenities" class="block text-muted-foreground hover:text-primary transition-colors">Amenities</a>
              <a routerLink="/auth/login" class="block text-muted-foreground hover:text-primary transition-colors">Login</a>
              <a routerLink="/auth/register" class="block text-muted-foreground hover:text-primary transition-colors">Register</a>
            </div>
          </div>
          <div>
            <h4 class="font-semibold text-card-foreground mb-4">Contact Us</h4>
            <div class="space-y-3 text-sm text-muted-foreground">
              <div class="flex items-center gap-2">
                <svg class="h-4 w-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                12, Koregaon Park Road, Pune, Maharashtra
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-4 w-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                +91 98765 43210
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-4 w-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                support&#64;grandhotel.com
              </div>
            </div>
          </div>
        </div>
        <div class="max-w-7xl mx-auto mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © 2026 Grand Stay Hotel. All rights reserved.
        </div>
      </footer>

    </div>
  `,
    styles: [`
    html { scroll-behavior: smooth; }
  `]
})
export class LandingPageComponent {
    private sanitizer = inject(DomSanitizer);
    mobileMenuOpen = signal(false);

    rooms = [
        { name: 'Standard Room', price: '₹8,999', image: 'assets/room1.png', desc: 'Comfortable room with modern amenities, perfect for business travelers.' },
        { name: 'Deluxe Room', price: '₹14,999', image: 'assets/room2.png', desc: 'Spacious luxury with king bed, city views, and premium furnishings.' },
        { name: 'Royal Suite', price: '₹29,999', image: 'assets/room4.png', desc: 'Ultimate indulgence with separate living area and panoramic views.' }
    ];

    facilities = [
        { name: 'Infinity Pool', image: 'assets/room5.png', desc: 'Crystal-clear waters with stunning poolside cabanas and bar service.' },
        { name: 'Fine Dining', image: 'assets/room3.png', desc: 'World-class cuisine crafted by award-winning chefs in an elegant setting.' },
        { name: 'Luxury Spa', image: 'assets/room2.png', desc: 'Rejuvenate with signature treatments and holistic wellness experiences.' }
    ];

    amenities: { label: string; icon: SafeHtml }[] = [
        {
            label: 'Free High-Speed WiFi',
            icon: this.safe('<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>')
        },
        {
            label: 'Valet Parking',
            icon: this.safe('<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 6H4l-1 6h16l-2-6h-4z"/></svg>')
        },
        {
            label: '24/7 Room Service',
            icon: this.safe('<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a6 6 0 0112 0H6z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 20h18"/></svg>')
        },
        {
            label: 'Fitness Center',
            icon: this.safe('<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h2m0-2v4m14-4v4m2-2h-2m-5-4v12m-4-6h4"/></svg>')
        },
        {
            label: '24/7 Security',
            icon: this.safe('<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>')
        },
        {
            label: 'Concierge Service',
            icon: this.safe('<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>')
        }
    ];

    private safe(html: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
