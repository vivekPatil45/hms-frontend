# Grand Stay Manager - Angular HMS Frontend

A luxury hotel management system UI built with Angular 17, featuring a sophisticated navy and gold design theme.

## 🎨 Design System

- **Primary Color**: Deep Navy Blue - Luxury hotel aesthetic
- **Secondary Color**: Warm Gold - Premium accent
- **Framework**: Angular 17 (Standalone Components)
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Inline SVG (Heroicons style)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development Server

```bash
# Start development server
npm start
# or
ng serve

# Application will be available at http://localhost:4200
```

### Build

```bash
# Production build
npm run build

# Development build
ng build --configuration development
```

## 📁 Project Structure

```
src/
├── app/
│   ├── models/              # TypeScript interfaces
│   │   ├── user.model.ts
│   │   ├── room.model.ts
│   │   ├── reservation.model.ts
│   │   ├── complaint.model.ts
│   │   └── bill.model.ts
│   ├── shared/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── button/
│   │   │   ├── loading-spinner/
│   │   │   ├── status-badge/
│   │   │   ├── stats-card/
│   │   │   ├── modal/
│   │   │   ├── header/
│   │   │   ├── sidebar/
│   │   │   └── footer/
│   │   └── utils/           # Utility functions
│   │       ├── cn.util.ts
│   │       └── constants.ts
│   ├── features/            # Feature modules
│   │   └── customer/
│   │       └── home/
│   └── app.component.ts
├── styles.css               # Global styles & design system
└── ...
```

## 🎯 Current Implementation

### ✅ Completed

- **Design System**: Complete Tailwind configuration with custom hotel theme
- **Global Styles**: CSS variables, animations, status badges, utilities
- **Models**: TypeScript interfaces for all entities (User, Room, Reservation, Complaint, Bill)
- **Shared Components**: 9 reusable components
  - Button (5 variants, 3 sizes)
  - LoadingSpinner
  - StatusBadge
  - StatsCard
  - Modal
  - Header
  - Sidebar
  - Footer
- **Sample Page**: Customer Home page demonstrating all components

### 🚧 To Be Implemented

- Additional pages (Auth, Customer, Admin, Staff modules)
- Services (Auth, API, HTTP interceptors)
- Routing & Guards
- Additional form components
- Data table component

## 🎨 Component Usage

### Button

```typescript
<app-button variant="default" size="md">
  Click Me
</app-button>
```

### Status Badge

```typescript
<app-status-badge [status]="'CONFIRMED'"></app-status-badge>
```

### Loading Spinner

```typescript
<app-loading-spinner size="lg" text="Loading..."></app-loading-spinner>
```

### Modal

```typescript
<app-modal 
  [isOpen]="isModalOpen" 
  title="Modal Title"
  (close)="closeModal()"
>
  Modal content here
</app-modal>
```

## 🎨 Design Tokens

### Colors

- **Primary**: `hsl(222 47% 20%)` - Deep Navy
- **Secondary**: `hsl(43 74% 49%)` - Warm Gold
- **Success**: `hsl(142 76% 36%)` - Green
- **Warning**: `hsl(38 92% 50%)` - Amber
- **Info**: `hsl(199 89% 48%)` - Blue
- **Destructive**: `hsl(0 84% 60%)` - Red

### Typography

- **Sans**: Inter
- **Display**: Playfair Display

## 📝 Notes

- All components are standalone (no NgModules required)
- Uses Angular 17's new control flow syntax (`@if`, `@for`)
- Mobile-first responsive design
- Dark mode support (CSS variables included)

## 🔗 Related Projects

- **React Version**: Grand Stay Manager (source for UI design)

## 📄 License

This project is for demonstration purposes.
