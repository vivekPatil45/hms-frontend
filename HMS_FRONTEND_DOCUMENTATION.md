# HMS Frontend Documentation

This document provides a comprehensive overview of the Hotel Management System (HMS) frontend, its architecture, state management, and component structure.

## 🚀 Technology Stack

The frontend is a modern Single Page Application (SPA) built with:

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Angular 17 | Latest signals-based framework for high performance. |
| **Styling** | Tailwind CSS | Utility-first CSS framework for rapid and consistent UI development. |
| **State** | RxJS & Signals | Handles asynchronous data streams and reactive state updates. |
| **Icons** | Heroicons / Custom | Scalable vector icons for a premium look. |
| **HTTP** | Angular HttpClient | Standardized API communication with interceptors for security. |
| **PDF** | jsPDF | Client-side invoice and report generation. |

---

## 🏗️ Project Architecture

The project follows a modular, feature-based architecture to ensure scalability and maintainability.

### 📁 Core Module (`src/app/core`)
Contains singleton services, universal guards, and interceptors that are required globally.
- **Guards**: `auth.guard.ts` (access control) and `role.guard.ts` (RBAC).
- **Interceptors**: `auth.interceptor.ts` (automatically attaches JWT to outgoing requests).
- **Services**: `auth.service.ts`, `api.service.ts`, `toast.service.ts`.

### 📁 Features Module (`src/app/features`)
Contains the main functional areas of the application, grouped by user role.
- **Auth**: Login, Registration, and Password management.
- **Customer**: Home, Room Discovery, Booking History, and Complaints.
- **Admin**: Dashboard, User management, Room Inventory, and Financial Reports.
- **Staff**: Specialized queue for handling assigned complaints.

### 📁 Shared Module (`src/app/shared`)
Contains reusable components, directives, and pipes used across multiple features.
- **UI Components**: Buttons, Modals, Data Tables, and Status Badges.
- **Layouts**: `auth-layout` and `dashboard-layout` (multi-role sidebar).

### 📁 Models (`src/app/models`)
Defines TypeScript interfaces and Enums to ensure type safety across the application.
- `user.model.ts`, `room.model.ts`, `reservation.model.ts`, `bill.model.ts`.

---

## 🔒 Security & Navigation

The application uses role-based access control (RBAC) to protect routes.

---

---

## 🚦 Routing & Navigation Architecture

The application uses an advanced, role-based routing system controlled by guards and interceptors to ensure secure and efficient navigation.

### 📄 `app.config.ts` (Application Configuration)
This is the root configuration file for the Angular application, replacing the traditional `AppModule` in Angular 17.
- **`provideZoneChangeDetection({ eventCoalescing: true })`**: Optimizes performance by reducing the number of change detection cycles when multiple events occur simultaneously.
- **`provideRouter(routes)`**: Enables state-of-the-art navigation by providing the route tree defined in `app.routes.ts`.
- **`provideHttpClient(withInterceptors([authInterceptor]))`**: Configures the HTTP client with functional interceptors. This is where the `authInterceptor` is registered globally to handle security tokens.
- **Dependency Injection**: It provides global instances like `DatePipe` so they can be injected into any service or component without manual instantiation.

### 📄 `app.routes.ts` (Routing Table)
Defines the mapping between URL paths and components.
- **Nested Routes (Children)**: Used to render feature components within a `DashboardLayoutComponent` or `AuthLayoutComponent`.
- **RBAC Enforcement**: Every protected route uses `canActivate` guards.
- **Lazy Loading**: Uses the `loadComponent` pattern (e.g., `() => import(...).then(m => m.AdminRoomsComponent)`). This drastically reduces the initial load time as code is only fetched when the user navigates to that specific route.
- **Fallback (`**`)**: Redirects all undefined paths back to the login page to prevent "Page Not Found" errors in a secured environment.

---

## 🔒 Security Infrastructure

### 🛡️ `auth.guard.ts` (Authentication Guard)
A functional guard that acts as the first line of defense for protected routes.
- **Login Check**: Injects `AuthService` to verify `isAuthenticated()`.
- **Return URL Logic**: Captures the attempted URL in `queryParams`. After a successful login, the system can redirect the user back to exactly where they were trying to go.
- **Password Enforcement**: Checks the `requirePasswordChange` flag. If true, it manually overrides navigation to send the user to the `/auth/change-password` screen, ensuring they cannot bypass security requirements.

### 🛡️ `role.guard.ts` (Role-Based Authorization)
A parameterized guard factory that restricts access to specific user categories (ADMIN, STAFF, CUSTOMER).
- **Multi-Role Support**: Accepts an array of `allowedRoles`, making it flexible enough to allow a route to be accessible by both ADMIN and STAFF if needed.
- **Smart Redirection**: If a user is logged in but lacks the correct role, it doesn't just block them; it "smart-routes" them to their own authorized dashboard (e.g., sending an ADMIN away from customer settings and back to the admin dashboard).

### ⚙️ `auth.interceptor.ts` (HTTP Decorator)
A functional interceptor that handles backend security handshake.
- **Stateless Auth**: Since the backend is RESTful and stateless, every single request must prove identity.
- **Request Cloning**: Requests in Angular are immutable. The interceptor clones the incoming request and adds the `Authorization: Bearer <JWT_TOKEN>` header before passing it to the next handler.
- **Zero-Config UI**: Components can make standard `http.get()` calls without worrying about headers; the interceptor handles all low-level security boilerplate.

---

## 🛠️ Core Services Reference

The service layer follows the singleton pattern, ensuring data consistency across the entire Single Page Application.

### Infrastructure Services
- **`ApiService`**: The base communication layer. It handles URL concatenation, header generation, and provides a unified `handleError` method to parse backend exceptions into user-friendly error messages.
- **`AuthService`**: The "Source of Truth" for user state. 
    - Maintains the `currentUser$` BehaviorSubject.
    - Handles `localStorage` persistence (storing and clearing the JWT).
    - Coordinates between components and the `/auth` backend endpoints.
- **`ToastService`**: A global event bus for system notifications. Components trigger `success()`, `error()`, or `info()`, which are rendered by the root `ToastComponent`.

### Business Logic Services
- **`AdminService`**: Primary controller for dashboard stats, staff user discovery, and the assignment/escalation of customer complaints.
- **`BookingService`**: Manages the complex "Room -> Reservation -> Payment" state machine. It handles multi-step guest workflows including availability checks and booking modifications.
- **`ComplaintService`**: Dedicated to the customer's lifecycle of lodging and tracking issues.
- **`RoomService`**: Performs high-performance room catalog fetching with support for server-side filtering.
- **`InvoiceService`**: A client-side utility that transforms `Reservation` models into formatted PDF documents using the `jsPDF` engine.
- **`StaffService`**: Manages the staff portal's workload, allowing staff members to log actions and resolve assigned tickets.
- **`AdminUserService` / `AdminBillService`**: Targeted services for bulk user management and financial audit trailing.

---

## 🛠️ Core Services Deep Dive

### AuthService.ts
- **`register()`**: Handles new guest account creation.
- **`login()`**: Performs authentication and sets the global `currentUser` signal.
- **`logout()`**: Clears the token and redirects to the login page.
- **`verifyToken()`**: Syncs local state with the backend on startup.

### ApiService.ts
- Acts as a base wrapper for all `HttpClient` calls (GET, POST, PUT, DELETE).
- Centralizes base URL handling and standardizes error parsing.

### AdminService.ts
- **`getDashboardStatistics()`**: Aggregates data for the admin home screen.
- **`getAllRooms()`**: Handles complex filtering and pagination for room management.
- **`getAllBills()`**: Provides the data source for financial tracking and search.

### BookingService.ts
- **`createReservation()`**: Initiates the booking flow for customers.
- **`checkAvailability()`**: Validates date ranges before allowing a booking attempt.
- **`modifyReservation()`**: Handles the logic for guest-initiated booking changes.

---

## 🎨 Design System & UI Components

The UI is designed to be premium and responsive using Tailwind CSS.

### Reusable Components
- **DataTableComponent**: A generic table that supports pagination, sorting, and custom action buttons.
- **ModalComponent**: A high-z-index overlay used for everything from booking confirmations to account resets.
- **ToastComponent**: A reactive notification system controlled by `ToastService` for success/error feedback.
- **StatsCardComponent**: Displays key metrics on dashboards with trend indicators.
- **StatusBadgeComponent**: Maps Enums like `ReservationStatus` to specific Tailwind color themes (e.g., BOOKED = Blue, CANCELLED = Red).

---

## 📋 Feature Workflows

### 🏨 Guest Booking Flow
1. **Discover**: Browse available rooms in `CustomerRoomsComponent`.
2. **Review**: View room details and select dates in `BookingConfirmationComponent`.
3. **Payment**: Enter transaction details in `PaymentComponent`.
4. **Confirmation**: Receive a unique reservation ID in `BookingSuccessComponent`.

### ⚙️ Admin Room Management
1. **View**: Access the global room list in `AdminRoomsComponent`.
2. **Edit**: Use the `AdminEditRoomModal` to update prices or amenities.
3. **Bulk**: Upload a CSV via `AdminRoomBulkImportComponent` for massive updates.

### 👷 Staff Task Management
1. **Queue**: View only assigned issues in `StaffComplaintsComponent`.
2. **Action**: Log progress on an issue (e.g., "Assigned technician") which is immediately visible to the customer.
